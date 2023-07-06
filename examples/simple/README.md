# Simple Forms

A basic email-password form with a manual error.

```typescript
const { useField, handle, loading } = useForm<{
  email: string;
  password: string;
}>({
  defaults: {
    email: "hello@example.com",
  },
});

const email = useField("email", {
  required: true,
});
const password = useField("password", {
  required: true,
});

const manualError = () => {
  password.setError("Random error 123");
};
```

## Running

```bash
cd examples/simple
pnpm dev
```
