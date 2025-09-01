<template>
    <div>
        <label class="form-label">
            <i class="fas fa-user me-1"></i>
            AWS Account
        </label>
        <div class="select-wrapper">
            <select class="form-select custom-select" :class="{ 'form-select-primary': selectedAccount }"
                :disabled="loading" :value="selectedAccount" @change="selectAccount($event.target.value)"
                aria-label="Select AWS Account">
                <option value="" disabled hidden>Select Account</option>
                <option v-for="account in accounts" :key="account.id" :value="account.id">
                    {{ account.account_name }}
                </option>
            </select>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AccountSelector',
    props: {
        selectedAccount: {
            type: String,
            default: ''
        },
        accounts: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        selectAccount(accountId) {
            this.$emit('account-change', accountId)
        }
    }
}
</script>

<style scoped>
.select-wrapper {
    position: relative;
}

.custom-select {
    appearance: none;
    background-color: #ffffff;
    border: 1px solid #6c757d;
    border-radius: 0.375rem;
    padding: 0.375rem 2.5rem 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #212529;
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
    transition: all 0.2s ease;
    cursor: pointer;
}

.custom-select:hover {
    border-color: #0d6efd;
}

.custom-select:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    outline: none;
}

.custom-select:disabled {
    background-color: #e9ecef;
    opacity: 0.65;
    cursor: not-allowed;
}

.form-select-primary {
    border-color: #0d6efd;
}

.select-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    pointer-events: none;
    z-index: 1;
}

/* Style the options */
.custom-select option {
    padding: 0.375rem 0.75rem;
    background-color: #ffffff;
    color: #212529;
}

.custom-select option:hover {
    background-color: #f8f9fa;
}

.custom-select option:checked {
    background-color: #e7f3ff;
    color: #0d6efd;
}
</style>