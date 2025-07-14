<template>
    <div>
        <label class="form-label">
            <i class="fas fa-user me-1"></i>
            AWS Account
        </label>
        <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" >
<!--                :class="{ 'btn-outline-primary': selectedAccount }">-->
                {{ selectedAccountName || 'Select Account'
              }}
            </button>
            <ul class="dropdown-menu w-100">
                <li v-for="account in accounts" :key="account.id">
                    <a class="dropdown-item d-flex justify-content-between align-items-center" href="#"
                        @click.prevent="selectAccount(account.id)"
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
        },
        accounts:{
          type:Array,
          default: ()=>[]
        }
    },
    computed: {
        selectedAccountName() {
          const account = this.accounts.find(a => a.id === this.selectedAccount);
          return account ? account.name : '';
        }
    },
    methods: {
        selectAccount(accountId) {
            this.$emit('account-change', accountId)
        },
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