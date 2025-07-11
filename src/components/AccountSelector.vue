<template>
    <div>
        <label class="form-label">
            <i class="fas fa-user me-1"></i>
            AWS Account
        </label>
        <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown"
                :class="{ 'btn-outline-primary': selectedAccount }">
                {{ getSelectedAccountName(selectedAccount) }}
            </button>
            <ul class="dropdown-menu w-100">
                <li v-for="account in accounts" :key="account.id">
                    <a class="dropdown-item d-flex justify-content-between align-items-center" href="#"
                        @click.prevent="handleAccountSelect(account.id)"
                        :class="{ 'active': selectedAccount === account.id }">
                        <div>
                            <div class="fw-medium">{{ account.name }}</div>
                            <small class="text-muted">{{ account.region }}</small>
                        </div>
                        <i v-if="selectedAccount === account.id" class="fas fa-check text-primary"></i>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
export default {
    name: 'AccountSelector',
    props: {
        selectedAccount: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            accounts: [
                { id: 'acc-1', name: 'Production Account', region: 'us-east-1' },
                { id: 'acc-2', name: 'Development Account', region: 'us-west-2' },
                { id: 'acc-3', name: 'Testing Account', region: 'eu-west-1' }
            ]
        }
    },
    methods: {
        handleAccountSelect(accountId) {
            this.$emit('accountChange', accountId)
        },
        getSelectedAccountName(accountId) {
            const account = this.accounts.find(acc => acc.id === accountId);
            return account ? account.name : 'Select Account';
        }
    }
}
</script>
<style scoped>
.dropdown-item {
    cursor: pointer;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
}

.dropdown-item.active {
    background-color: #e7f3ff;
    color: #0d6efd;
}
</style>