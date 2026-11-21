<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, useId, useTemplateRef } from 'vue'
import type { UserFormValues } from './types'
import { validateUserForm } from './userFormValidation'
import type { UserFormErrors } from './userFormValidation'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialValues: Readonly<UserFormValues>
}>()

const emit = defineEmits<{
  cancel: []
  submit: [values: UserFormValues]
}>()

const textFields = [
  { name: 'name', label: '姓名', type: 'text', autocomplete: 'name' },
  { name: 'phone', label: '手机号', type: 'tel', autocomplete: 'tel' },
  { name: 'email', label: '邮箱', type: 'email', autocomplete: 'email' },
] as const

const fieldOrder = [...textFields.map(field => field.name), 'status'] as const
const formId = useId()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const { name, phone, email, status } = props.initialValues
const draft = reactive<UserFormValues>({ name, phone, email, status })
const errors = ref<UserFormErrors>({})
const isSubmitting = ref(false)

onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())

function cancel() {
  if (!isSubmitting.value) {
    emit('cancel')
  }
}

async function submit() {
  if (isSubmitting.value) return

  const validity = dialog.value?.querySelector<HTMLInputElement>('input[name="email"]')?.validity
  const emailValidity = validity && {
    badInput: validity.badInput,
    typeMismatch: validity.typeMismatch,
  }
  const { values, fieldErrors } = validateUserForm(draft, emailValidity)
  errors.value = fieldErrors
  const firstInvalidField = fieldOrder.find(field => fieldErrors[field])

  if (firstInvalidField) {
    await nextTick()
    dialog.value?.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus()
    return
  }

  isSubmitting.value = true
  emit('submit', values)
}
</script>

<template>
  <dialog
    ref="dialog"
    class="user-form-dialog"
    :aria-labelledby="`${formId}-title`"
    @cancel.prevent="cancel"
  >
    <h2 :id="`${formId}-title`">
      {{ mode === 'edit' ? '编辑用户' : '新增用户' }}
    </h2>
    <form
      novalidate
      @submit.prevent="submit"
    >
      <div
        v-for="field in textFields"
        :key="field.name"
        class="form-field"
      >
        <label :for="`${formId}-${field.name}`">{{ field.label }}</label>
        <input
          :id="`${formId}-${field.name}`"
          v-model="draft[field.name]"
          :name="field.name"
          :type="field.type"
          :autocomplete="field.autocomplete"
          :autofocus="field.name === 'name'"
          :aria-invalid="Boolean(errors[field.name])"
          :aria-describedby="errors[field.name] ? `${formId}-${field.name}-error` : undefined"
          required
        >
        <p
          v-if="errors[field.name]"
          :id="`${formId}-${field.name}-error`"
          class="field-error"
        >
          {{ errors[field.name] }}
        </p>
      </div>
      <div class="form-field">
        <label :for="`${formId}-status`">用户状态</label>
        <select
          :id="`${formId}-status`"
          v-model="draft.status"
          name="status"
          :aria-invalid="Boolean(errors.status)"
          :aria-describedby="errors.status ? `${formId}-status-error` : undefined"
          required
        >
          <option value="active">
            正常
          </option>
          <option value="disabled">
            禁用
          </option>
        </select>
        <p
          v-if="errors.status"
          :id="`${formId}-status-error`"
          class="field-error"
        >
          {{ errors.status }}
        </p>
      </div>
      <div class="form-actions">
        <button
          type="button"
          :disabled="isSubmitting"
          @click="cancel"
        >
          取消
        </button>
        <button
          class="submit-button"
          type="submit"
          :disabled="isSubmitting"
        >
          {{ mode === 'edit' ? '保存修改' : '提交' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.user-form-dialog {
  box-sizing: border-box;
  width: min(30rem, calc(100% - 2rem));
  max-height: calc(100dvh - 2rem);
  padding: clamp(1rem, 4vw, 1.5rem);
  overflow-y: auto;
  border: 1px solid #dfe7f1;
  border-radius: 0.9rem;
  background: #fff;
  color: #132440;
  text-align: left;
}

.user-form-dialog::backdrop {
  background: rgb(19 36 64 / 55%);
}

h2 {
  margin: 0 0 1.25rem;
  color: inherit;
  font: 700 1.25rem / 1.4 system-ui, 'Microsoft YaHei', sans-serif;
  letter-spacing: normal;
}

form,
.form-field {
  display: grid;
}

form {
  gap: 1rem;
}

.form-field {
  gap: 0.35rem;
}

label {
  font-size: 0.875rem;
  font-weight: 650;
}

input,
select,
button {
  box-sizing: border-box;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd8e8;
  border-radius: 0.6rem;
  background: #fff;
  color: #20324f;
  font: inherit;
}

input:focus-visible,
select:focus-visible,
button:focus-visible {
  outline: 2px solid #205ed3;
  outline-offset: 2px;
}

[aria-invalid='true'] {
  border-color: #a12632;
}

.field-error {
  color: #a12632;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

button {
  font-size: 0.875rem;
  font-weight: 650;
  cursor: pointer;
}

button:not(:disabled):hover {
  background: #edf3fb;
}

.submit-button {
  border-color: #205ed3;
  background: #205ed3;
  color: #fff;
}

.submit-button:not(:disabled):hover {
  background: #184eae;
}

button:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
