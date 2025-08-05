<template>
    <div class="auth-container">
        <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
            <div class="row w-100 justify-content-center">
                <div class="col-md-6 col-lg-4">
                    <div class="card shadow-lg border-0">
                        <div class="card-body p-5">

                            <div class="text-center mb-4">
                                <i class="fas fa-cloud fa-3x text-primary mb-3"></i>
                                <h2 class="card-title mb-2">S3 File Manager</h2>
                                <p class="text-muted">Sign in to your account</p>
                            </div>

                            <!-- error message to show -->
                            <div v-if="apiError" class="alert alert-danger alert-dismissible fade show" role="alert">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                {{ apiError }}
                            </div>


                            <form @submit.prevent="handleLogin">
                                <div class="mb-3">
                                    <label for="email" class="form-label">
                                        <i class="fas fa-envelope me-1"></i>
                                        Email Address
                                    </label>
                                    <input type="email" class="form-control" id="email" v-model="form.email"
                                        placeholder="Enter your email" />
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
import api from "@/utils/api"
export default {
    name: 'LoginPage',
    data() {
        return {
            form: {
                email: '',
                password: ''
            },
            apiError: '',
            isSubmitting: false,
            showPassword: false,
            errorTimeout: null,
        }
    },
    methods: {
        async handleLogin() {
            try {
                this.isSubmitting = true;
                this.clearApiError();
                const response = await api.post('/auth/login', {
                    email: this.form.email,
                    password: this.form.password
                });

                //store info in localstorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                this.$router.push({ name: 'Home' });
            } catch (error) {
                if (error.response) {
                    const errorMessage = error.response.data.message || 'Login failed. Please try again.';
                    this.showApiError(errorMessage);
                } else {
                    this.showApiError('Network error or server is not responding.');
                }

            } finally {
                this.isSubmitting = false;
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