<template>
    <div class="auth-container">
        <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
            <div class="row w-100 justify-content-center">
                <div class="col-md-6 col-lg-4">
                    <div class="card shadow-lg border-0">
                        <div class="card-body p-5">
                            <!-- Login form header -->
                            <div class="text-center mb-4">
                                <i class="fas fa-cloud fa-3x text-primary mb-3"></i>
                                <h2 class="card-title mb-2">S3 File Manager</h2>
                                <p class="text-muted">Sign in to your account</p>
                            </div>

                            <!-- API Error Message -->
                            <div v-if="apiError" class="alert alert-danger alert-dismissible fade show" role="alert">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                {{ apiError }}
                            </div>

                            <!-- Login form -->
                            <form @submit.prevent="handleSubmit">
                                <div class="mb-3">
                                    <label for="email" class="form-label">
                                        <i class="fas fa-envelope me-1"></i>
                                        Email Address
                                    </label>
                                    <input type="email" class="form-control" id="email" v-model="form.email"
                                        :class="{ 'is-invalid': errors.email }" placeholder="Enter your email" />
                                    <div class="invalid-feedback" v-if="errors.email">
                                        {{ errors.email }}
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <label for="password" class="form-label">
                                        <i class="fas fa-lock me-1"></i>
                                        Password
                                    </label>
                                    <div class="input-group">
                                        <input :type="showPassword ? 'text' : 'password'" class="form-control"
                                            id="password" v-model="form.password" placeholder="Enter your password" />
                                        <button type="button" class="btn btn-outline-secondary"
                                            @click="showPassword = !showPassword">
                                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Login button -->
                                <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="isSubmitting">
                                    <span v-if="isSubmitting">
                                        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Signing In...
                                    </span>
                                    <span v-else>
                                        <i class="fas fa-sign-in-alt me-2"></i>
                                        Sign In
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as yup from 'yup';
import axios from 'axios';

export default {
    name: 'LoginPage',
    data() {
        return {
            form: {
                email: '',
                password: ''
            },
            errors: {
                email: ''
            },
            apiError: '',
            isSubmitting: false,
            showPassword: false,
            errorTimeout: null,
            validationSchema: yup.object().shape({
                email: yup.string()
                    .required('Email is required')
                    .email('Please enter a valid email')
            })
        }
    },
    methods: {
        async handleSubmit() {
            this.isSubmitting = true;
            this.clearApiError();
            try {

                await this.validateForm();


                if (!this.errors.email) {
                    await this.login();
                }
            } catch (error) {
                console.error('Login error:', error);
            } finally {
                this.isSubmitting = false;
            }
        },
        async validateForm() {
            try {

                this.errors = { email: '' };


                await this.validationSchema.validate(this.form, { abortEarly: false });
            } catch (err) {

                err.inner.forEach(error => {
                    this.errors[error.path] = error.message;
                });
                throw err;
            }
        },
        async login() {
            try {
                const response = await axios.get('http://localhost:3000/api/auth/login', {
                    email: this.form.email,
                    password: this.form.password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                if (!response.data.success) {
                    throw new Error('Invalid credentials');
                }
                //store info in localstorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                this.$router.push({ name: 'Home' });
            } catch (error) {
                this.showApiError(error.message || 'Login failed. Please try again.');
            }
        },
        showApiError(message) {
            this.apiError = message;

            if (this.errorTimeout) clearTimeout(this.errorTimeout);

            this.errorTimeout = setTimeout(() => {
                this.apiError = '';
            }, 3000);
        },
        clearApiError() {
            this.apiError = '';
            if (this.errorTimeout) {
                clearTimeout(this.errorTimeout);
                this.errorTimeout = null;
            }
        }
    },
    beforeUnmount() {
        if (this.errorTimeout) clearTimeout(this.errorTimeout);
    }
}
</script>

<style scoped>
.auth-container {
    min-height: 100vh;
}

.card {
    border-radius: 15px;
}

.form-control:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
    background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
    border: none;
    border-radius: 8px;
    padding: 12px;
    font-weight: 500;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

.input-group .btn {
    border-left: none;
}

.spinner-border-sm {
    width: 1rem;
    height: 1rem;
}

@media (max-width: 768px) {
    .card-body {
        padding: 2rem !important;
    }
}

.invalid-feedback {
    display: block;
    color: #dc3545;
    margin-top: 0.25rem;
    font-size: 0.875rem;
}

.is-invalid {
    border-color: #dc3545;
}

.alert {
    transition: opacity 0.5s ease;
}
</style>