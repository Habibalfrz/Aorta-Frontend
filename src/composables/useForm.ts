import { ref, Ref } from 'vue'
import { ZodType, ZodError } from 'zod'

export function useForm<T extends Record<string, any>>(
  schema: ZodType<T>,
  initialValues: T
) {
  // Reactive state
  const data = ref({ ...initialValues }) as Ref<T>
  const errors = ref<Record<string, string>>({})
  const isSubmitting = ref(false)

  // Clear all errors
  const clearErrors = () => {
    errors.value = {}
  }

  // Validate form data against Zod schema
  const validate = (): boolean => {
    clearErrors()
    const result = schema.safeParse(data.value)

    if (!result.success) {
      const zodError = result.error as ZodError
      const newErrors: Record<string, string> = {}

      zodError.errors.forEach((err) => {
        if (err.path && err.path.length > 0) {
          const field = err.path.join('.')
          // Keep only the first error for each field
          if (!newErrors[field]) {
            newErrors[field] = err.message
          }
        }
      })

      errors.value = newErrors
      return false
    }

    return true
  }

  // Map .NET API ValidationProblemDetails to our errors state
  const setApiErrors = (error: any) => {
    clearErrors()

    // Check if it's an Axios error with response
    if (error?.response?.data) {
      const responseData = error.response.data

      // Check for .NET ValidationProblemDetails structure (HTTP 400 with 'errors' object)
      if (error.response.status === 400 && responseData.errors) {
        const apiErrors = responseData.errors
        const newErrors: Record<string, string> = {}

        // .NET typically returns: { "FieldName": ["Error 1", "Error 2"] }
        for (const [field, messages] of Object.entries(apiErrors)) {
          if (Array.isArray(messages) && messages.length > 0) {
            // Capitalize first letter of field to match our camelCase model if needed
            // but usually we just keep it as is and map it in the template
            const formattedField = field.charAt(0).toLowerCase() + field.slice(1)
            newErrors[formattedField] = messages[0] as string

            // Also map exactly as received just in case
            if (formattedField !== field) {
              newErrors[field] = messages[0] as string
            }
          }
        }

        errors.value = newErrors
        return
      }

      // Fallback for generic error message
      if (responseData.title || responseData.message) {
        errors.value = {
          _global: responseData.title || responseData.message || 'An error occurred'
        }
      }
    } else {
      errors.value = {
        _global: error instanceof Error ? error.message : 'Network or unknown error'
      }
    }
  }

  return {
    data,
    errors,
    isSubmitting,
    validate,
    setApiErrors,
    clearErrors
  }
}
