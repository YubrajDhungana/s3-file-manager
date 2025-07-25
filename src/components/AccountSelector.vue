<template>
    <div>
        <label class="form-label">
            <i class="fas fa-user me-1"></i>
            AWS Account
        </label>
        <div ref="dropdownRef" class="dropdown" :class="{ show: isDropdownOpen }">
            <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button" @click="toggleDropdown"
                @keydown.enter="toggleDropdown" @keydown.space.prevent="toggleDropdown"
                :class="{ 'btn-outline-primary': selectedAccount }" :aria-expanded="isDropdownOpen"
                aria-haspopup="true">
                {{ selectedAccountName || 'Select Account' }}
            </button>
            <ul class="dropdown-menu w-100" :class="{ show: isDropdownOpen }" role="menu">
                <li v-for="account in accounts" :key="account.id">
                    <button type="button"
                        class="dropdown-item d-flex justify-content-between align-items-center w-100 border-0 bg-transparent text-start"
                        href="#" @click.prevent="selectAccount(account.id)"
                        @keydown.enter.prevent="selectAccount(account.id)"
                        @keydown.space.prevent="selectAccount(account.id)"
                        :class="{ 'active': selectedAccount === account.id }" role="menuitem"
                        :tabindex="isDropdownOpen ? 0 : -1">
                        <div>
                            <div class="fw-medium">{{ account.name }}</div>
                            <small class="text-muted">{{ account.region }}</small>
                        </div>
                        <i v-if="selectedAccount === account.id" class="fas fa-check text-primary"></i>
                    </button>
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
            default: ''
        },
        accounts: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            isDropdownOpen: false
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
            this.closeDropdown()
        },

        toggleDropdown() {
            this.isDropdownOpen = !this.isDropdownOpen
        },
        closeDropdown() {
            this.isDropdownOpen = false
        },
        handleClickOutside(event) {
            if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(event.target)) {
                this.closeDropdown()
            }
        },
        handleKeydown(event) {
            if (event.key === 'Escape') {
                this.closeDropdown()
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside)
        document.addEventListener('keydown', this.handleKeydown)
    },
    unmounted() {
        document.removeEventListener('click', this.handleClickOutside)
        document.removeEventListener('keydown', this.handleKeydown)
    }
}
</script>


<style scoped>
.dropdown-item,
.dropdown-item:focus {
    cursor: pointer;
    outline: none;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
}

.dropdown-item.active {
    background-color: #e7f3ff;
    color: #0d6efd;
}

.dropdown-item:focus {
    background-color: #f8f9fa;
}

.dropdown-toggle:focus {
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
</style>