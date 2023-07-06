<template>
    <form @submit.prevent="submit">
        <label for="email">Email Address</label>
        <input
            type="email"
            name="email"
            id="email"
            placeholder="Email Address"
            :disabled="loading"
            @focus="email.clearError"
            v-model="email.value"
        />
        <p class="err" v-if="email.hasError">{{ email.error?.message }}</p>
        <hr />
        <label for="email">Password</label>
        <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            :disabled="loading"
            @focus="password.clearError"
            v-model="password.value"
        />
        <p class="err" v-if="password.hasError">{{ password.error?.message }}</p>
        <hr />
        <button
            type="submit"
            :disabled="loading"
        >Login</button>
        <button
            :disabled="loading"
            @click.prevent="manualError"
        >Manual error on Password</button>
    </form>
</template>

<script lang="ts" setup>
    import { useForm } from '@/../../../src';

    const sleep = (length: number) => new Promise(resolve => window.setTimeout(resolve, length * 1000));

    type MyForm = {
        userDetails: {
            email: string;
            password: string;
        },
        demographic: {
            age: number,
            height: number,
            weight: number,
        }
    }

    const { useField, handle, loading } = useForm<MyForm>({
        defaults: {
            userDetails: {
                email: 'hello@example.com'
            }
        },
    });

    const email = useField('userDetails.email', {
        required: true,
    });
    const password = useField('userDetails.password', {
        required: true,
    });
    const age = useField('demographic', {
        required: true
    })

    const submit = handle(async (data) => {
        await sleep(2);
        console.group('SUBMITTED DATA:')
        console.log(data);
        console.groupEnd();
    });

    const manualError = () => {
        password.setError('Random error 123');
    };
</script>

<style>
    .err {
        color: red;
    }
</style>
@/index