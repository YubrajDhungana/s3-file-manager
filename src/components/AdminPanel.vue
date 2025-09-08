[file name]: AdminPanel.vue
[file content begin]
<template>
    <div v-if="isSuperAdmin" class="admin-panel">
        <!-- Admin Tabs -->
        <ul class="nav nav-tabs mb-4" id="adminTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="roles-tab" data-bs-toggle="tab" data-bs-target="#roles"
                    type="button" role="tab" aria-controls="roles" aria-selected="true">
                    <i class="fas fa-user-tag me-2"></i>
                    Roles
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="users-tab" data-bs-toggle="tab" data-bs-target="#users" type="button"
                    role="tab" aria-controls="users" aria-selected="false">
                    <i class="fas fa-users me-2"></i>
                    User Management
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="bucket-permissions-tab" data-bs-toggle="tab"
                    data-bs-target="#bucket-permissions" type="button" role="tab" aria-controls="bucket-permissions"
                    aria-selected="false">
                    <i class="fas fa-database me-2"></i>
                    Bucket Permissions
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="adminTabContent">
            <!-- Roles Tab -->
            <div class="tab-pane fade show active" id="roles" role="tabpanel" aria-labelledby="roles-tab">
                <div class="card card-custom">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-user-tag me-2"></i>
                            Role Management
                        </h5>
                        <div>
                            <button class="btn btn-primary btn-sm" @click="showCreateRoleModal">
                                <i class="fas fa-plus me-1"></i>
                                Create Role
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Role Name</th>
                                        <th>Role Id</th>
                                        <th>Assigned Buckets</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="role in roles" :key="role.role_id">
                                        <td>
                                            <span class="badge bg-primary">{{ role.name }}</span>
                                        </td>
                                        <td>{{ role.role_id }}</td>
                                        <td>
                                            <span v-if="role.name.toLowerCase() === 'admin'" class="text-success">
                                                Full access to all buckets
                                            </span>
                                            <span v-else-if="role.buckets.length === 0" class="text-muted">No buckets
                                                assigned</span>
                                            <div v-else class="bucket-tags">
                                                <span v-for="bucket in role.buckets.slice(0, 3)" :key="bucket"
                                                    class="badge bg-secondary me-1 mb-1">
                                                    {{ bucket }}
                                                </span>
                                                <span v-if="role.buckets.length > 3" class="badge bg-light text-dark">
                                                    +{{ role.buckets.length - 3 }} more
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button v-if="role.name.toLowerCase() !== 'admin'"
                                                    class="btn btn-outline-info me-1"
                                                    @click="showManageRoleBuckets(role)" title="Manage Buckets">
                                                    <i class="fas fa-database"></i>
                                                </button>
                                                <button v-if="role.name.toLowerCase() !== 'admin'"
                                                    class="btn btn-outline-danger" @click="deleteRole(role)"
                                                    title="Delete Role">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Users Tab -->
            <div class="tab-pane fade" id="users" role="tabpanel" aria-labelledby="users-tab">
                <div class="card card-custom">
                    <div class="card-header">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-users me-2"></i>
                            User Management
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Current Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="user in users" :key="user.id">
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <i class="fas fa-user-circle me-2 text-muted"></i>
                                                {{ user.name }}
                                            </div>
                                        </td>
                                        <td>{{ user.email }}</td>
                                        <td>
                                            <span v-if="user.role_name" class="badge bg-primary">{{ user.role_name
                                                }}</span>
                                            <span v-else class="text-muted">No role assigned</span>
                                        </td>
                                        <td>
                                            <span class="badge"
                                                :class="user.status === 'allowed' ? 'bg-success' : 'bg-secondary'">
                                                {{ user.status }}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-outline-primary btn-sm"
                                                @click="assignRoleToUser(user)" title="Assign Role"
                                                :disabled="!!user.role_name">
                                                <i class="fas fa-user-tag me-1"></i>
                                                Assign Role
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bucket Permissions Tab -->
            <div class="tab-pane fade" id="bucket-permissions" role="tabpanel" aria-labelledby="bucket-permissions-tab">
                <div class="card card-custom">
                    <div class="card-header">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-database me-2"></i>
                            Bucket to Role
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <label class="form-label">Select Role</label>
                                <select v-model="selectedRoleForBuckets" class="form-select"
                                    @change="handleRoleSelection">
                                    <option value="">Choose a role...</option>
                                    <option v-for="role in roles.filter(r => r.name.toLowerCase() !== 'admin')"
                                        :key="role.role_id" :value="role.role_id">
                                        {{ role.name }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div v-if="selectedRoleForBuckets" class="bucket-permissions-container">
                            <div class="row mb-4">
                                <div v-if="loadingRoleSelection" class="mt-2">
                                    <small class="text-muted">
                                        <i class="fas fa-spinner fa-spin me-1"></i>
                                        Loading accounts...
                                    </small>
                                </div>
                                <div v-else class="col-md-6">
                                    <label class="form-label">Select Account</label>
                                    <select v-model="selectedAccount" class="form-select"
                                        @change="handleAccountSelection">
                                        <option value="">Choose an account</option>
                                        <option v-for="account in accounts" :key="account.id" :value="account.id">
                                            {{ account.account_name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div v-if="selectedAccount" class="bucket-permissions-container">
                            <div class="row mb-4">
                                <div v-if="loadingAccountSelection" class="mt-2">
                                    <span class="text-muted">
                                        <i class="fas fa-spinner fa-spin me-1"></i>
                                        Loading buckets...
                                    </span>
                                </div>
                                <div v-else class="col-md-6">
                                    <label class="form-label">Select bucket</label>
                                    <select v-model="selectedBucket" class="form-select">
                                        <option value="">Choose a bucket</option>
                                        <option v-for="bucket in allBuckets" :key="bucket.Name" :value="bucket.Name">
                                            {{ bucket.Name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-primary" @click="saveBucketPermissions" :disabled="!selectedBucket">
                                <i class="fas fa-save me-1"></i>
                                Save Permissions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create Role Modal -->
        <div class="modal fade" id="roleModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create New Role</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveRole">
                            <div class="mb-3">
                                <label class="form-label">Role Name</label>
                                <input type="text" class="form-control" v-model="roleForm.name" required
                                    placeholder="Enter role name">
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">
                                    Create Role
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>

        <!-- Assign Role to User Modal -->
        <div class="modal fade" id="assignRoleModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Assign Role to User</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">User</label>
                            <input type="text" class="form-control" :value="selectedUser?.name" disabled>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Select Role</label>
                            <select v-model="selectedRoleForUser" class="form-select">
                                <option value="">No role</option>
                                <option v-for="role in roles" :key="role.role_id" :value="role.role_id">
                                    {{ role.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="saveUserRole">
                            Assign Role
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Manage Role Buckets Modal -->
        <div class="modal fade" id="manageBucketsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-database me-2"></i>
                            Manage Buckets for: {{ selectedRoleForBucketManagement?.name }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="roleBucketsLoading" class="text-center py-4">
                            <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
                            <p class="mt-2">Loading buckets...</p>
                        </div>

                        <div v-if="!roleBucketsLoading" class="role-buckets-container">
                            <h6 class="mb-3">Assigned Buckets</h6>

                            <div v-if="roleBuckets.length === 0" class="alert alert-info">
                                No buckets assigned to this role.
                            </div>

                            <div v-else class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Bucket Name</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="bucket in roleBuckets" :key="bucket.bucket_name">
                                            <td>{{ bucket.bucket_name }}</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline-danger"
                                                    @click="confirmDeleteBucket(bucket)" title="Remove Bucket">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import api from '@/utils/api';
import { useToast } from "vue-toastification";

export default {
    name: 'AdminPanel',
    props: {
        isSuperAdmin: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            roles: [],
            users: [],
            accounts: [],
            allBuckets: [],
            userId: '',
            selectedRoleForBuckets: '',
            selectedAccount: '',
            selectedBucket: '',
            roleForm: {
                name: '',
            },
            selectedUser: null,
            selectedRoleForUser: '',

            // For bucket management
            selectedRoleForBucketManagement: null,
            roleBuckets: [],
            roleBucketsLoading: false,

            // For bucket permissions tab
            loadingRoleSelection: false,
            loadingAccountSelection: false,

            // Modals
            roleModal: null,
            assignRoleModal: null,
            manageBucketsModal: null
        };
    },
    mounted() {
        if (this.isSuperAdmin) {
            this.initializeModals();
            this.loadUserData();
            this.loadRoleData();
        }
    },
    methods: {
        initializeModals() {
            this.roleModal = new Modal(document.getElementById('roleModal'));
            this.assignRoleModal = new Modal(document.getElementById('assignRoleModal'));
            this.manageBucketsModal = new Modal(document.getElementById('manageBucketsModal'));
        },

        async fetchAccounts() {
            try {
                const response = await api.get('/accounts/');
                if (response.data) {
                    this.accounts = response.data;
                } else {
                    this.accounts = [];
                }
            } catch (error) {
                console.log("error loading accounts")
            }
        },

        async fetchBuckets(id) {
            try {
                const response = await api.get(`/buckets/${id}/s3-buckets`);
                if (response.data) {
                    this.allBuckets = response.data
                } else {
                    this.allBuckets = [];
                }
            } catch (error) {
                console.log("error fetching buckets")
            }
        },

        async loadUserData() {
            try {
                const response = await api.get('/roles/get-users');
                if (response.data.user) {
                    this.users = response.data.user;
                }
            } catch (error) {
                console.log("error loading user data");
            }
        },

        async loadRoleData() {
            try {
                const response = await api.get("/roles/list-roles");
                this.roles = response.data.data.map(role => ({
                    role_id: role.role_id,
                    name: role.role_name,
                    buckets: role.buckets ? role.buckets.split(',') : []
                }));
            } catch (error) {
                console.log(error)
            }
        },

        showCreateRoleModal() {
            this.roleForm = { name: '' };
            this.roleModal.show();
        },

        showManageRoleBuckets(role) {
            this.selectedRoleForBucketManagement = role;
            this.roleBuckets = [];
            this.loadRoleBuckets();
            this.manageBucketsModal.show();
        },

        async loadRoleBuckets() {
            if (!this.selectedRoleForBucketManagement) {
                this.roleBuckets = [];
                return;
            }

            this.roleBucketsLoading = true;
            try {
                const response = await api.get(`/roles/${this.selectedRoleForBucketManagement.role_id}/get-buckets`);
                if (response.data && response.data.buckets) {
                    this.roleBuckets = response.data.buckets;
                } else {
                    this.roleBuckets = [];
                }
            } catch (error) {
                console.error("Error loading role buckets:", error);
                this.roleBuckets = [];
            } finally {
                this.roleBucketsLoading = false;
            }
        },

        async handleRoleSelection() {
            this.selectedAccount = '';
            this.selectedBucket = '';
            this.accounts = [];
            this.allBuckets = [];

            if (this.selectedRoleForBuckets) {
                this.loadingRoleSelection = true;
                try {
                    await this.fetchAccounts();
                } catch (error) {
                    console.error("Error loading accounts:", error);
                } finally {
                    this.loadingRoleSelection = false;
                }
            }
        },

        async handleAccountSelection() {
            this.selectedBucket = '';
            this.allBuckets = [];

            if (this.selectedAccount) {
                this.loadingAccountSelection = true;
                try {
                    await this.fetchBuckets(this.selectedAccount);
                } catch (error) {
                    console.error("Error loading buckets:", error);
                } finally {
                    this.loadingAccountSelection = false;
                }
            }
        },

        confirmDeleteBucket(bucket) {
            if (confirm(`Are you sure you want to remove bucket "${bucket.bucket_name}" from this role?`)) {
                this.deleteBucketFromRole(bucket);
            }
        },

        async deleteBucketFromRole(bucket) {
            const toast = useToast();
            try {
                const response = await api.delete(
                    `/roles/${this.selectedRoleForBucketManagement.role_id}/delete-bucket`,
                    {
                        params: {
                            bucketName: bucket.bucket_name
                        }
                    }
                );

                if (response.data.message) {
                    toast.success(response.data.message);
                    this.loadRoleBuckets();
                    this.loadRoleData();
                }
            } catch (error) {
                console.error("Error deleting bucket from role");
            }
        },

        async saveRole() {
            const toast = useToast();
            try {
                const response = await api.post('/roles/create-role', {
                    name: this.roleForm.name
                });
                if (response.data.message === 'Role created successfully') {
                    toast.success(response.data.message);
                    this.loadRoleData();
                }
            } catch (error) {
                console.log(error);
            } finally {
                this.roleModal.hide();
            }
        },

        async deleteRole(role) {
            const roleId = role.role_id;
            const toast = useToast();
            try {
                if (confirm(`Are you sure you want to delete the role "${role.name}"? This will remove this role from all users. This action cannot be undone.`) === false) {
                    return;
                }
                const response = await api.delete(`/roles/${roleId}/delete-role`);
                if (response.data.message) {
                    toast.success(response.data.message);
                    await Promise.all([this.loadRoleData(), this.loadUserData()]);
                }
            } catch (error) {
                console.log("error deleting role");
            }
        },

        async saveBucketPermissions() {
            const toast = useToast();
            try {
                if (this.selectedRoleForBuckets && this.selectedAccount && this.selectedBucket) {
                    const response = await api.post(`/roles/${this.selectedRoleForBuckets}/account/${this.selectedAccount}/buckets`, {
                        bucketName: this.selectedBucket
                    });
                    if (response.data.message) {
                        toast.success(response.data.message);
                        this.loadRoleData();
                        this.selectedRoleForBuckets = '';
                        this.selectedAccount = '';
                        this.selectedBucket = '';
                    }
                } else {
                    toast.error("All field selections are required");
                }
            } catch (error) {
                console.log("error assigning bucket to role");
            }
        },

        assignRoleToUser(user) {
            this.selectedUser = user;
            this.userId = user.id;
            this.selectedRoleForUser = user.role_id || '';
            this.assignRoleModal.show();
        },

        async saveUserRole() {
            const toast = useToast();
            try {
                const response = await api.post(`/roles/${this.userId}/role/${this.selectedRoleForUser}`);
                if (response.data.message) {
                    this.loadUserData();
                    toast.success(response.data.message);
                }
            } catch (error) {
                console.log("error assigning role");
            } finally {
                this.selectedRoleForUser = '';
                this.assignRoleModal.hide();
            }
        },
    }
};
</script>

<style scoped>
.admin-panel {
    margin-bottom: 2rem;
}

.nav-tabs .nav-link {
    border: none;
    border-bottom: 3px solid transparent;
    color: #6c757d;
    padding: 0.75rem 1.25rem;
    font-weight: 500;
}

.nav-tabs .nav-link.active {
    color: #0d6efd;
    border-bottom-color: #0d6efd;
    background-color: transparent;
}

.nav-tabs .nav-link:hover {
    border-bottom-color: #dee2e6;
}

.bucket-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
}

.badge {
    font-size: 0.75rem;
}

.btn-group-sm>.btn {
    padding: 0.25rem 0.5rem;
}

.available-buckets {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    padding: 1rem;
}

.form-check {
    padding-left: 2rem;
}

.form-check-input {
    moved-left: -2rem;
}

.modal-content {
    border: none;
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
    border-bottom: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
}

.modal-footer {
    border-top: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
}

.card-title {
    color: #495057;
    font-weight: 600;
    margin: 0;
}

.role-buckets-container {
    max-height: 400px;
    overflow-y: auto;
}


select:disabled {
    background-color: #f8f9fa;
    opacity: 0.7;
}


.btn-outline-info {
    color: #0dcaf0;
    border-color: #0dcaf0;
}

.btn-outline-info:hover {
    color: #000;
    background-color: #0dcaf0;
    border-color: #0dcaf0;
}
</style>
[file content end]