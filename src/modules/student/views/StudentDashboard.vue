<template>
  <StudentLayout @edit-profile="openEditProfileModal">
    <div class="dashboard-wrapper">
      <div v-if="loading" class="dashboard-content px-0">
        <div class="hero-section skeleton mb-4" style="height: 240px; border: none;"></div>
        <div class="detail-main-grid">
           <div class="content-col">
              <div class="detail-card skeleton mb-4" style="height: 300px; border: none;"></div>
              <div class="detail-card skeleton mb-4" style="height: 200px; border: none;"></div>
           </div>
           <div class="sidebar-col">
              <div class="detail-card skeleton mb-4" style="height: 400px; border: none;"></div>
           </div>
        </div>
      </div>

      <div v-else-if="studentData" class="dashboard-content">
        <!-- Hero Section -->
      <div class="hero-section mb-4">
        <div class="hero-bg" :style="studentData.profile_picture ? `background-image: url(${studentData.profile_picture})` : ''"></div>
          <div class="hero-content">
            <div class="avatar-wrapper">
              <img :src="studentData.profile_picture || `https://ui-avatars.com/api/?name=${studentData.full_name}&background=random`" alt="Avatar" class="avatar-img" loading="lazy" />
            </div>
            <div class="hero-info">
              <div class="badge-row">
                <span class="premium-badge">
                  <i class="bi bi-star-fill text-warning"></i> Active Beneficiary
                </span>
              </div>
              <h1 class="beneficiary-name">{{ studentData.full_name }}</h1>
              <p class="academic-subtitle">
                <i class="bi bi-mortarboard-fill"></i>
                {{ studentData.school }} &bull; {{ studentData.department }} | {{ studentData.level ? studentData.level + 'L' : 'Graduated' }}
              </p>
            </div>
            <div class="edit-profile">
              <button @click="openEditProfileModal" class="btn btn-primary">
                <i class="bi bi-pencil-square"></i>
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <!-- New content for detail cards adapted for student module -->
        <!-- <div class="metrics-grid mb-4">
          Digital Wallet Card
          <div class="card-details wallet-card">
            <div class="card-header-title">
              <div class="card-icon">
                <i class="bi bi-cash-stack"></i>
              </div>
              <h3>Total Received</h3>
            </div>
            <div class="card-body">
              <h2 class="wallet-balance">₦{{ formatCurrency(totalReceived) }}</h2>
            </div>
            <div class="card-footer">
              <div class="fee-info">
                <span class="text-sm opacity-75" style="font-size: 0.8rem;">Current School Fees</span>
                <span class="text-md fw-bold" style="font-size: 1.1rem;">₦{{ formatCurrency(studentData.school_fees) }}</span>
              </div>
              <div class="bank-pill" v-if="studentData.bank_name">
                <i class="bi bi-bank2"></i> {{ studentData.bank_name }}
              </div>
            </div>
          </div>

          Academic Progress Card
          <div class="metric-card academic-card">
            <div class="card-head between">
              <span class="card-label">Academic Progress</span>
              <div class="icon-box-sm bg-glass">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
            </div>
            <div class="progress-stats mt-3">
              <div class="stat-big">{{ academicProgressStats.percentage }}%</div>
              <div class="stat-desc">{{ academicProgressStats.recorded }} of {{ academicProgressStats.total }} Semesters Configured</div>
            </div>
            <div class="progress-bar-container mt-3">
               <div class="progress-bar-fill" :style="{ width: academicProgressStats.percentage + '%' }"></div>
            </div>
          </div>

          Quick Info Card
          <div class="metric-card info-card">
            <div class="card-head between">
              <span class="card-label">Student Profile</span>
              <div class="icon-box-sm bg-glass">
                <i class="bi bi-person-badge"></i>
              </div>
            </div>
            <div class="info-list mt-3">
               <div class="info-item">
                 <span class="info-lbl">Admission</span>
                 <span class="info-val">{{ studentData.year_of_admission || 'N/A' }}</span>
               </div>
               <div class="info-item">
                 <span class="info-lbl">Duration</span>
                 <span class="info-val">{{ studentData.course_duration ? studentData.course_duration + ' Years' : 'N/A' }}</span>
               </div>
               <div class="info-item">
                 <span class="info-lbl">Remaining</span>
                 <span class="info-val">{{ studentData.years_remaining !== undefined ? studentData.years_remaining + ' Years' : 'N/A' }}</span>
               </div>
            </div>
          </div>
        </div> -->

        <!-- Main Detail Grid -->
        <div class="detail-main-grid">
          <!-- Left Column -->
          <div class="content-col">

            <!-- Academic Performance -->
            <div class="detail-card mb-4">
              <div class="card-head">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-mortarboard-fill"></i>
                  <h3>Academic Performance</h3>
                </div>
                <button class="add-btn-sm" @click="openAcademicModal" :disabled="pendingSemesters.length === 0">
                  <i class="bi bi-plus-lg"></i> <span class="btn-text">Add GPA</span>
                </button>
              </div>
              <div class="card-body">
                <div v-if="academicProgressStats.total > 0" class="academic-progress-container">
                  <div class="progress-header">
                    <div class="progress-info">
                      <span class="progress-label">Academic Progress</span>
                      <span class="progress-count">{{ academicProgressStats.recorded }} of {{ academicProgressStats.total }} semesters</span>
                    </div>
                    <div class="progress-percentage">{{ academicProgressStats.percentage }}%</div>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill" :style="{ width: academicProgressStats.percentage + '%' }"></div>
                  </div>
                </div>
                <div v-if="academicProgress && academicProgress.length > 0" class="chart-wrapper">
                  <canvas ref="academicChart" id="academic-performance-chart"></canvas>
                </div>
              </div>
            </div>

            <!-- Financial Overview -->
            <div class="detail-card financial-card mb-4 hide-card">
              <div class="card-head between">
                <i class="bi bi-wallet2"></i>
                <h3>Financial Overview</h3>
              </div>
              <div class="fin-card-body">
                <div class="financial-stat">
                  <label>Total Amount Received</label>
                  <div class="stat-amount primary">₦{{ formatCurrency(totalReceived) }}</div>
                </div>
                <div class="financial-sep"></div>
                <div class="financial-stat">
                  <label>School Fees</label>
                  <div class="stat-amount blue">₦{{ formatCurrency(studentData.school_fees) }}</div>
                </div>
                <div class="bank-info">
                  <label class="info-lbl-sm">Payment Details</label>
                  <div class="bank-item">
                    <i class="bi bi-bank"></i>
                    <div class="bank-det">
                      <span class="bank-name">{{ studentData.bank_name || 'N/A' }}</span>
                      <span class="bank-acc-name">{{ studentData.account_name || 'No Account Name' }}</span>
                      <span class="bank-acc">{{ studentData.account_number || 'No Account Number' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Remarks & Documents -->
            <div class="detail-card mb-4">
              <div class="card-head between">
                <i class="bi bi-file-earmark-text-fill"></i>
                <h3>Remarks &amp; Documents</h3>
              </div>
              <div class="card-body">
                <div class="remarks-box mb-4">
                  <label class="info-lbl-sm">Remarks / Notes</label>
                  <p class="remarks-text">{{ studentData.remarks || 'No additional remarks registered for this beneficiary.' }}</p>
                </div>
                <div class="doc-links">
                  <label class="info-lbl-sm">Uploaded Documents</label>
                  <div class="doc-grid">
                    <a
                      v-if="studentData.admission_letter_url"
                      :href="studentData.admission_letter_url"
                      download
                      class="doc-item"
                    >
                      <div class="doc-icon pdf">
                        <i class="bi bi-file-earmark-pdf"></i>
                      </div>
                      <div class="doc-info">
                        <span class="doc-name">Admission Letter</span>
                        <span class="doc-meta">Download Document <i class="bi bi-download"></i></span>
                      </div>
                    </a>
                    <div v-else class="no-docs-upload">
                      <div class="no-docs-info">
                        <i class="bi bi-info-circle"></i>
                        <span>No admission letter uploaded yet.</span>
                      </div>
                      <button @click="triggerAdmissionUpload" class="upload-inline-btn" :disabled="admissionLoading">
                        <span v-if="admissionLoading" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="bi bi-cloud-arrow-up-fill me-1"></i>
                        {{ admissionLoading ? 'Uploading...' : 'Upload Now' }}
                      </button>
                      <input 
                        type="file" 
                        ref="admissionFileInput" 
                        @change="handleAdmissionLetterUpload" 
                        hidden 
                        accept=".pdf,image/*"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal & Academic Information -->
            <div class="detail-card mb-4">
              <div class="card-head between">
                <i class="bi bi-person-lines-fill"></i>
                <h3>Personal &amp; Academic Information</h3>
              </div>
              <div class="card-body">
                <div class="info-grid">
                  <div class="info-group">
                    <label>Full Name</label>
                    <span>{{ studentData.full_name }}</span>
                  </div>
                  <div class="info-group">
                    <label>Email Address</label>
                    <span>{{ studentData.email || '—' }}</span>
                  </div>
                  <div class="info-group">
                    <label>Phone Number</label>
                    <span>{{ studentData.phone_number }}</span>
                  </div>
                  <div class="info-group">
                    <label>Gender</label>
                    <span class="capitalize">{{ studentData.gender }}</span>
                  </div>
                  <div class="info-group">
                    <label>Current level</label>
                    <span>{{ studentData.level ? `${studentData.level} Level` : 'Graduated' }}</span>
                  </div>
                  <div class="info-group">
                    <label>Course Duration</label>
                    <span>{{ studentData.course_duration ? `${studentData.course_duration} Years` : '—' }}</span>
                  </div>
                  <div class="info-group">
                    <label>Admission Date</label>
                    <span>{{ formatDate(studentData.admission_date) }}</span>
                  </div>
                  <div class="info-group full-width">
                    <label>Institution</label>
                    <span>{{ studentData.school }}</span>
                  </div>
                  <div class="info-group full-width">
                    <label>Department / Course</label>
                    <span>{{ studentData.department }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Parent / Guardian -->
            <div class="detail-card mb-4">
              <div class="card-head between">
                <i class="bi bi-people-fill"></i>
                <h3>Parent / Guardian Information</h3>
              </div>
              <div class="card-body">
                <div class="info-grid half">
                  <div class="info-group">
                    <label>Guardian Name</label>
                    <span>{{ studentData.parent_name || 'Not provided' }}</span>
                  </div>
                  <div class="info-group">
                    <label>Guardian Phone</label>
                    <span>{{ studentData.parent_phone || 'Not provided' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment History (read-only) -->
            <div class="detail-card mb-4">
              <div class="card-head between">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-credit-card-fill"></i>
                  <h3>Payment History</h3>
                </div>
              </div>
              <div class="card-body p-0">
                <div v-if="studentData && studentData.payments && studentData.payments.length > 0" class="table-responsive">
                  <table class="modern-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th class="text-end">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="payment in studentData.payments" :key="payment.id">
                        <td data-label="Date">{{ formatDate(payment.date) }}</td>
                        <td data-label="Description" class="text-truncate" >{{ payment.description }}</td>
                        <td data-label="Amount" class="fw-bold">₦{{ formatCurrency(payment.amount) }}</td>
                        <td data-label="Status">
                          <span class="status-dot" :class="payment.status"></span>
                          <span class="status-name">{{ payment.status }}</span>
                        </td>
                        <td data-label="Receipt" class="text-end">
                          <div class="d-flex justify-content-end">
                            <a 
                              v-if="payment.evidence_url" 
                              :href="payment.evidence_url" 
                              target="_blank" 
                              class="action-icon-btn primary" 
                              title="View Receipt"
                            >
                              <i class="bi bi-file-earmark-text"></i>
                            </a>
                            <span v-else class="text-muted small">No receipt</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="empty-state-card w-100 mx-auto">
                  <div class="empty-icon"><i class="bi bi-receipt"></i></div>
                  <h4 class="empty-title">No Payment History</h4>
                  <p class="empty-subtitle">There are no payments recorded for you yet.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Sidebar -->
          <div class="sidebar-col">
            <!-- Financial Overview -->
            <div class="detail-card financial-card mb-4 show-card">
              <div class="card-head between">
                <i class="bi bi-wallet2"></i>
                <h3>Financial Overview</h3>
              </div>
              <div class="fin-card-body">
                <div class="financial-stat">
                  <label>Total Amount Received</label>
                  <div class="stat-amount primary">₦{{ formatCurrency(totalReceived) }}</div>
                </div>
                <div class="financial-sep"></div>
                <div class="financial-stat">
                  <label>School Fees</label>
                  <div class="stat-amount blue">₦{{ formatCurrency(studentData.school_fees) }}</div>
                </div>
                <div class="bank-info">
                  <label class="info-lbl-sm">Payment Details</label>
                  <div class="bank-item">
                    <i class="bi bi-bank"></i>
                    <div class="bank-det">
                      <span class="bank-name">{{ studentData.bank_name || 'N/A' }}</span>
                      <span class="bank-acc-name">{{ studentData.account_name || 'No Account Name' }}</span>
                      <span class="bank-acc">{{ studentData.account_number || 'No Account Number' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Academic Records List -->
            <div v-if="academicProgress && academicProgress.some(r => r.status === 'Recorded')" class="detail-card mb-4">
              <div class="card-head between">
                <i class="bi bi-award"></i>
                <h3>Academic Records</h3>
              </div>
              <div class="card-body">
                <div class="records-stack">
                  <div v-for="record in academicProgress.filter(r => r.status === 'Recorded')" :key="record.record_id" class="record-item">
                    <div class="record-info">
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="sem-label">{{ record.expected_semester_label }}</span>
                        <span 
                          class="status-badge-sm" 
                          :class="record.verification_status || 'pending'"
                        >
                          {{ record.verification_status || 'pending' }}
                        </span>
                      </div>
                      <span class="record-gpa-val">GPA: <strong>{{ record.gpa }}</strong></span>
                    </div>
                    <div class="record-actions">
                      <a
                        v-if="record.evidence_url"
                        :href="record.evidence_url"
                        target="_blank"
                        class="record-action-btn view"
                        title="View Evidence"
                      >
                        <i class="bi bi-file-earmark-check"></i>
                        <span>View</span>
                      </a>
                      <button
                        v-if="confirmingDeleteId !== record.record_id"
                        type="button"
                        @click.stop.prevent="confirmingDeleteId = record.record_id"
                        class="record-action-btn delete"
                        title="Delete Record"
                      >
                        <i class="bi bi-trash"></i>
                        <span>Delete</span>
                      </button>
                      <div v-else class="d-flex gap-2">
                        <button
                          type="button"
                          @click.stop.prevent="confirmDeleteAcademicRecord(record.record_id)"
                          class="record-action-btn delete"
                          style="background: #ef4444; color: white;"
                          title="Click to Confirm"
                        >
                          <i class="bi bi-exclamation-triangle"></i>
                          <span>Confirm</span>
                        </button>
                        <button
                          type="button"
                          @click.stop.prevent="confirmingDeleteId = null"
                          class="record-action-btn bg-secondary text-white border-0"
                          title="Cancel"
                        >
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state-card w-100 mx-auto mb-4">
              <div class="empty-icon"><i class="bi bi-journal-x"></i></div>
              <h4 class="empty-title">No Academic Records</h4>
              <p class="empty-subtitle">You do not have any recorded grades for past semesters yet.</p>
            </div>

            
            <!-- CHANGE PASSWORD -->
            <div class="detail-card financial-card mb-4">
              <div class="card-head between">
                <i class="bi bi-gear"></i>
                <h3>Settings</h3>
              </div>
              <div class="fin-card-body">
                <div class="setting-item">
                  <button type="button" class="custom-btn custom-btn-primary w-100" @click="openPasswordModal">
                    <i class="bi bi-shield-lock-fill me-2"></i>
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            <!-- Audit Log -->
            <div class="detail-card">
              <div class="card-body mini-audit">
                <p>Created on {{ formatDate(studentData.created_at) }}</p>
                <p v-if="studentData.updated_at">Last updated {{ formatDate(studentData.updated_at) }}</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div v-else class="alert alert-danger mt-4">
        <h4>Connection Error</h4>
        <p>Could not load your student record from the database. Please try logging in again.</p>
      </div>

    </div>

    <!-- Custom Toast Notification -->
    <Transition name="toast-slide">
      <div v-if="toast.show" class="custom-toast" :class="`toast-${toast.type}`">
        <div class="toast-icon">
          <i class="bi" :class="toast.type === 'error' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'"></i>
        </div>
        <div class="toast-content">
          <strong class="toast-title">{{ toast.type === 'error' ? 'Error' : 'Success' }}</strong>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button type="button" class="toast-close" @click="toast.show = false">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </Transition>

    <!-- Record GPA Modal -->
    <Transition name="modal-fade">
      <div v-if="showAcademicModal" class="custom-modal-backdrop" @click.self="showAcademicModal = false">
        <div class="custom-modal-wrapper" style="max-width: 500px;">
          <div class="custom-modal-header">
            <div class="header-titles">
              <div class="header-icon">
                <i class="bi bi-award"></i>
              </div>
              <div class="title-group">
                <h3 class="custom-modal-title">Record Semester GPA</h3>
                <p class="custom-modal-subtitle">Submit your academic performance for review</p>
              </div>
            </div>
            <button type="button" class="custom-close-btn" @click="showAcademicModal = false" :disabled="academicLoading">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <form @submit.prevent="submitAcademicRecord" class="custom-modal-form">
            <div class="custom-modal-body" style="gap: 1.25rem;">
              <div class="custom-input-group">
                <label class="custom-label">Select Semester <span class="required">*</span></label>
                <select v-model="academicForm.year" class="custom-select" required>
                  <option value="" disabled>Choose a pending semester</option>
                  <option v-for="sem in pendingSemesters" :key="sem.value" :value="sem.value">
                    {{ sem.label }}
                  </option>
                </select>
                <div class="form-text mt-1" style="font-size: 0.75rem; color: var(--text-muted);">Only showing semesters yet to be recorded</div>
              </div>

              <!-- Selected Semester Display -->
              <div v-if="selectedSemesterLabel" class="semester-preview p-2 rounded" style="background: rgba(107, 89, 255, 0.05); border: 1px dashed rgba(107, 89, 255, 0.2);">
                <small class="text-muted d-block mb-1">Recording for:</small>
                <div class="fw-bold text-primary">{{ selectedSemesterLabel }}</div>
              </div>

              <div class="custom-input-group">
                <label class="custom-label">GPA (0.00 - 5.00) <span class="required">*</span></label>
                <input type="number" v-model="academicForm.gpa" class="custom-input" required min="0" max="5.0" step="0.01" placeholder="e.g. 4.25">
                <div v-if="parseFloat(academicForm.gpa) >= 4.0" class="mt-1">
                  <small class="text-success fw-bold" style="display:flex;align-items:center;gap:.4rem;">
                    <i class="bi bi-star-fill"></i> Eligible for high performance incentive!
                  </small>
                </div>
              </div>

              <div class="custom-input-group">
                <label class="custom-label">Evidence (Result/Transcript) <span class="required">*</span></label>
                <input type="file" @change="handleFileUpload" class="custom-input" accept=".pdf,image/*" required>
                <div class="form-text mt-1" style="font-size: 0.75rem; color: var(--text-muted);">Upload a clear PDF or image of the result as evidence.</div>
              </div>
            </div>

            <div class="custom-modal-footer">
              <button type="button" class="custom-btn custom-btn-outline" @click="showAcademicModal = false" :disabled="academicLoading">Cancel</button>
              <button type="submit" class="custom-btn custom-btn-primary" :disabled="academicLoading || !academicForm.year">
                <span v-if="academicLoading" class="loader-sm mr-2"></span>
                <span v-else>Record GPA</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
    
    <!-- Change Password Modal -->
    <Transition name="modal-fade">
      <div v-if="showPasswordModal" class="custom-modal-backdrop" @click.self="showPasswordModal = false">
        <div class="custom-modal-wrapper" style="max-width: 500px;">
          <div class="custom-modal-header">
            <div class="header-titles">
              <div class="header-icon" style="background: rgba(107, 89, 255, 0.1); color: var(--color-primary);">
                <i class="bi bi-shield-lock-fill"></i>
              </div>
              <div class="title-group">
                <h3 class="custom-modal-title">Change Password</h3>
                <p class="custom-modal-subtitle">Secure your account by updating your password</p>
              </div>
            </div>
            <button type="button" class="custom-close-btn" @click="showPasswordModal = false" :disabled="passwordUpdateLoading">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <form @submit.prevent="handleSecurePasswordChange" class="custom-modal-form">
            <div class="custom-modal-body">
              <div class="form-section mb-0">
                <div class="custom-input-group full-width mb-3">
                  <label class="custom-label">Current Password</label>
                  <div class="password-input-wrapper">
                    <input 
                      :type="showCurrentPassword ? 'text' : 'password'" 
                      v-model="passwordUpdateForm.currentPassword" 
                      class="custom-input" 
                      placeholder="Enter current password"
                      required
                    >
                    <button type="button" class="password-toggle" @click="showCurrentPassword = !showCurrentPassword">
                      <i :class="showCurrentPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>

                <div class="custom-form-grid">
                  <div class="custom-input-group">
                    <label class="custom-label">New Password</label>
                    <div class="password-input-wrapper">
                      <input 
                        :type="showNewPassword ? 'text' : 'password'" 
                        v-model="passwordUpdateForm.newPassword" 
                        class="custom-input" 
                        placeholder="Min. 6 characters"
                        required
                      >
                      <button type="button" class="password-toggle" @click="showNewPassword = !showNewPassword">
                        <i :class="showNewPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Confirm New Password</label>
                    <div class="password-input-wrapper">
                      <input 
                        :type="showConfirmPassword ? 'text' : 'password'" 
                        v-model="passwordUpdateForm.confirmPassword" 
                        class="custom-input" 
                        placeholder="Repeat new password"
                        required
                      >
                      <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                        <i :class="showConfirmPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-muted mt-3">
                  <i class="bi bi-info-circle-fill me-1"></i>
                  Note: For security, you'll need to re-verify your identity before updating.
                </p>
              </div>
            </div>

            <div class="custom-modal-footer">
              <button type="button" class="custom-btn custom-btn-outline" @click="showPasswordModal = false" :disabled="passwordUpdateLoading">Cancel</button>
              <button type="submit" class="custom-btn custom-btn-primary" :disabled="passwordUpdateLoading">
                <span v-if="passwordUpdateLoading" class="loader-sm mr-2"></span>
                <span v-else>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Edit Profile Modal -->
    <Transition name="modal-fade">
      <div v-if="showEditModal" class="custom-modal-backdrop" @click.self="showEditModal = false">
        <div class="custom-modal-wrapper" style="max-width: 850px;">
          <div class="custom-modal-header">
            <div class="header-titles">
              <div class="header-icon edit-icon">
                <i class="bi bi-person-gear"></i>
              </div>
              <div class="title-group">
                <h3 class="custom-modal-title">Edit Profile</h3>
                <p class="custom-modal-subtitle">Update your personal and banking information</p>
              </div>
            </div>
            <button type="button" class="custom-close-btn" @click="showEditModal = false" :disabled="editLoading">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <form @submit.prevent="handleUpdateProfile" class="custom-modal-form">
            <div class="custom-modal-body">
              <div class="edit-modal-layout-new">
                <!-- Left: Avatar Upload -->
                <div class="avatar-edit-col">
                  <div class="profile-avatar big">
                    <img v-if="profilePreview || studentData.profile_picture" :src="profilePreview || studentData.profile_picture" alt="Avatar">
                    <span v-else>{{ studentData.full_name?.charAt(0) }}</span>
                    <label class="avatar-upload-overlay">
                      <i class="bi bi-camera-fill"></i>
                      <input type="file" @change="handleProfileImageUpload" accept="image/*" hidden>
                    </label>
                  </div>
                  <p class="text-sm text-center text-muted mt-2">Click icon to change picture</p>
                </div>

                <!-- Right: Form Fields -->
                <div class="form-fields-col">
                  <div class="form-section">
                    <h4 class="section-title">Personal Details</h4>
                    <div class="custom-form-grid">
                      <div class="custom-input-group full-width">
                        <label class="custom-label">Full Name (Read-only)</label>
                        <input type="text" :value="studentData.full_name" class="custom-input" disabled style="opacity: 0.7; cursor: not-allowed;">
                      </div>
                      <div class="custom-input-group">
                        <label class="custom-label">Email Address</label>
                        <input type="email" v-model="editForm.email" class="custom-input" placeholder="Email">
                      </div>
                      <div class="custom-input-group">
                        <label class="custom-label">Phone Number</label>
                        <input type="text" v-model="editForm.phone_number" class="custom-input" placeholder="Phone">
                      </div>
                      <div class="custom-input-group">
                        <label class="custom-label">Gender</label>
                        <select v-model="editForm.gender" class="custom-select">
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="form-section mt-4">
                    <h4 class="section-title">Parent / Guardian Information</h4>
                    <div class="custom-form-grid">
                      <div class="custom-input-group">
                        <label class="custom-label">Guardian Name</label>
                        <input type="text" v-model="editForm.parent_name" class="custom-input" placeholder="Guardian Name">
                      </div>
                      <div class="custom-input-group">
                        <label class="custom-label">Guardian Phone</label>
                        <input type="text" v-model="editForm.parent_phone" class="custom-input" placeholder="Guardian Phone">
                      </div>
                    </div>
                  </div>

                  <div class="form-section mt-4">
                    <h4 class="section-title">Banking Information</h4>
                    <div class="custom-form-grid">
                      <div class="custom-input-group full-width">
                        <label class="custom-label">Bank Name</label>
                        <input type="text" v-model="editForm.bank_name" class="custom-input" placeholder="e.g. Zenith Bank">
                      </div>
                      <div class="custom-input-group">
                        <label class="custom-label">Account Name</label>
                        <input type="text" v-model="editForm.account_name" class="custom-input" placeholder="Account Name">
                      </div>
                      <div class="custom-input-group">
                        <label class="custom-label">Account Number</label>
                        <input type="text" v-model="editForm.account_number" class="custom-input" placeholder="10 Digits">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="custom-modal-footer">
              <button type="button" class="custom-btn custom-btn-outline" @click="showEditModal = false" :disabled="editLoading">Cancel</button>
              <button type="submit" class="custom-btn custom-btn-primary" :disabled="editLoading">
                <span v-if="editLoading" class="loader-sm mr-2"></span>
                <span v-else>Update Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

   </StudentLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import StudentLayout from '../../../layouts/StudentLayout.vue'
import { useSupabaseStudents, useSupabaseAuth } from '../../../composables/useSupabase.js'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const router = useRouter()
const { signIn, updatePassword } = useSupabaseAuth()
const { 
  getStudent, 
  getAcademicProgress, 
  createAcademicRecord, 
  uploadAcademicEvidence, 
  uploadProfileImage,
  uploadAdmissionLetter,
  updateStudent,
  deleteAcademicRecord,
  subscribeToStudentUpdates 
} = useSupabaseStudents()

const confirmingDeleteId = ref(null)

const showPasswordModal = ref(false)
const passwordUpdateForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordUpdateLoading = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)


const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, 4500)
}

const studentData = ref(null)
const academicProgress = ref([])
const loading = ref(true)
const academicChart = ref(null)
const chartInstance = ref(null)

// GPA Modal state
const showAcademicModal = ref(false)
const academicLoading = ref(false)
const academicEvidenceFile = ref(null)
const academicForm = ref({ year: '', gpa: '', student_id: '' })

// Edit Profile Modal state
const showEditModal = ref(false)
const editLoading = ref(false)
const profileImageFile = ref(null)
const profilePreview = ref('')
const editForm = ref({
  email: '',
  phone_number: '',
  gender: '',
  parent_name: '',
  parent_phone: '',
  bank_name: '',
  account_name: '',
  account_number: ''
})

// Admission Letter state
const admissionLoading = ref(false)
const admissionFileInput = ref(null)

let realtimeSubscription = null

const totalReceived = computed(() => {
  if (!studentData.value || !studentData.value.payments) return 0
  return studentData.value.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
})

const academicProgressStats = computed(() => {
  if (!studentData.value) return { total: 0, recorded: 0, percentage: 0 }
  const total = (studentData.value.course_duration || 4) * 2
  const recorded = academicProgress.value.filter(r => r.status === 'Recorded').length
  const percentage = total > 0 ? Math.round((recorded / total) * 100) : 0
  return { total, recorded, percentage }
})

const formatCurrency = (amount) => {
  if (!amount) return '0.00'
  return Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

// Pending semester selector
const pendingSemesters = computed(() => {
  if (!studentData.value || !academicProgress.value) return []
  return academicProgress.value
    .filter(r => r.status === 'Not Recorded')
    .map(r => ({
      value: r.semester_number,
      label: r.expected_semester_label,
      semesterNumber: r.semester_number
    }))
})

const selectedSemesterLabel = computed(() => {
  if (!academicForm.value.year) return ''
  const pending = pendingSemesters.value.find(s => s.value === academicForm.value.year)
  return pending ? pending.label : ''
})

const openEditProfileModal = () => {
  if (!studentData.value) return
  
  editForm.value = {
    email: studentData.value.email || '',
    phone_number: studentData.value.phone_number || '',
    gender: studentData.value.gender || 'male',
    parent_name: studentData.value.parent_name || '',
    parent_phone: studentData.value.parent_phone || '',
    bank_name: studentData.value.bank_name || '',
    account_name: studentData.value.account_name || '',
    account_number: studentData.value.account_number || ''
  }
  
  profileImageFile.value = null
  profilePreview.value = ''
  showEditModal.value = true
}

const handleProfileImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    profileImageFile.value = file
    profilePreview.value = URL.createObjectURL(file)
  }
}

const triggerAdmissionUpload = () => {
  if (admissionFileInput.value) {
    admissionFileInput.value.click()
  }
}

const handleAdmissionLetterUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  admissionLoading.value = true
  try {
    const { url, error } = await uploadAdmissionLetter(studentData.value.id, file)
    if (error) throw error

    const result = await updateStudent(studentData.value.id, {
      admission_letter_url: url,
      updated_at: new Date().toISOString()
    })
    if (result.error) throw result.error

    showToast('Admission letter uploaded successfully!', 'success')
    
    // Refresh local data
    const { data } = await getStudent(studentData.value.id)
    if (data) {
      studentData.value = data
      localStorage.setItem('student_session', JSON.stringify(data))
    }
  } catch (err) {
    console.error('Error uploading admission letter:', err)
    showToast(err.message || 'Failed to upload admission letter. Please try again.', 'error')
  } finally {
    admissionLoading.value = false
    if (admissionFileInput.value) admissionFileInput.value.value = ''
  }
}

const handleUpdateProfile = async () => {
  editLoading.value = true
  try {
    let profile_picture = studentData.value.profile_picture

    if (profileImageFile.value) {
      const { url, error: uploadError } = await uploadProfileImage(studentData.value.id, profileImageFile.value)
      if (uploadError) throw uploadError
      profile_picture = url
    }

    const updates = {
      ...editForm.value,
      profile_picture,
      updated_at: new Date().toISOString()
    }

    const result = await updateStudent(studentData.value.id, updates)
    if (result.error) throw result.error

    showEditModal.value = false
    showToast('Profile updated successfully!', 'success')
    
    // Refresh local data
    const { data } = await getStudent(studentData.value.id)
    if (data) {
      studentData.value = data
      localStorage.setItem('student_session', JSON.stringify(data))
    }

  } catch (err) {
    console.error('Error updating profile:', err)
    showToast(err.message || 'Failed to update profile. Please try again.', 'error')
  } finally {
    editLoading.value = false
  }
}

const openPasswordModal = () => {
  passwordUpdateForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showPasswordModal.value = true
}

const handleSecurePasswordChange = async () => {
  const { currentPassword, newPassword, confirmPassword } = passwordUpdateForm.value

  if (!currentPassword || !newPassword || !confirmPassword) {
    showToast('Please fill in all password fields.', 'error')
    return
  }

  if (newPassword.length < 6) {
    showToast('New password must be at least 6 characters.', 'error')
    return
  }

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match.', 'error')
    return
  }

  passwordUpdateLoading.value = true
  try {
    // 1. Verify Current Password by attempting re-authentication
    const { error: verifyError } = await signIn(studentData.value.email, currentPassword)
    
    if (verifyError) {
      throw new Error('Incorrect current password. Please try again.')
    }

    // 2. Update to new password
    const { error: updateError } = await updatePassword(newPassword)
    if (updateError) throw updateError

    showToast('Password updated successfully!', 'success')
    showPasswordModal.value = false
  } catch (err) {
    console.error('Password change error:', err)
    showToast(err.message || 'Failed to update password.', 'error')
  } finally {
    passwordUpdateLoading.value = false
  }
}


const openAcademicModal = () => {
  academicForm.value = { year: '', gpa: '', student_id: studentData.value?.id || '' }
  academicEvidenceFile.value = null
  showAcademicModal.value = true
}

const handleFileUpload = (event) => {
  academicEvidenceFile.value = event.target.files[0]
}

const submitAcademicRecord = async () => {
  academicLoading.value = true
  try {
    let evidence_url = ''
    if (academicEvidenceFile.value) {
      const { url, error } = await uploadAcademicEvidence(studentData.value.id, academicEvidenceFile.value)
      if (error) throw error
      evidence_url = url
    }

    const selectedSem = academicProgress.value.find(r => r.semester_number === academicForm.value.year)
    if (!selectedSem) throw new Error('Please select a valid semester.')

    // Derive semester position and year from semester_number
    const semPos = selectedSem.semester_number % 2 === 0 ? 2 : 1
    const yearNum = Math.ceil(selectedSem.semester_number / 2)
    const semesterLabel = semPos === 1 ? '1st' : '2nd'
    
    // Build session string from admission date
    const admissionDateArr = studentData.value.admission_date ? new Date(studentData.value.admission_date) : new Date()
    const admissionYear = admissionDateArr.getFullYear()
    const sessionStartYear = admissionYear + yearNum - 1
    const session = `${sessionStartYear}/${sessionStartYear + 1}`

    const payload = {
      student_id: studentData.value.id,
      semester: semesterLabel,
      session: session,
      gpa: academicForm.value.gpa === '' ? null : Number.parseFloat(academicForm.value.gpa),
      semester_number: selectedSem.semester_number,
      evidence_url,
      status: 'pending'
    }

    const { error } = await createAcademicRecord(payload)
    if (error) throw error

    // Refresh academic progress to update chart & records
    const { data: progress } = await getAcademicProgress(studentData.value.id)
    academicProgress.value = progress || []
    showAcademicModal.value = false

    if ((payload.gpa ?? 0) >= 4.0) {
      showToast('Congratulations! You are eligible for the High Performance Incentive.', 'success')
    } else {
      showToast('Academic record saved successfully!', 'success')
    }
  } catch (err) {
    console.error('Error saving GPA record:', err)
    let msg = 'Failed to save record. Please try again.'
    if (err?.message && err.message.toLowerCase().includes('row-level security')) {
      msg = 'Permission Error: Database security policy blocked this action.'
    } else if (err?.message) {
      msg = `Failed to save record: ${err.message}`
    }
    showToast(msg, 'error')
  } finally {
    academicLoading.value = false
  }
}

const confirmDeleteAcademicRecord = async (recordId) => {
  console.log('Final confirmation clicked for record:', recordId);
  try {
    const { error } = await deleteAcademicRecord(recordId)
    if (error) throw error
    
    // Reset the confirmation button state
    confirmingDeleteId.value = null
    
    // Refresh table
    const { data: progress } = await getAcademicProgress(studentData.value.id)
    academicProgress.value = progress || []
  } catch (err) {
    console.error('Delete academic record error:', err)
    showToast('Failed to delete record: ' + (err.message || 'Unknown error'), 'error')
  }
}

const renderAcademicChart = async () => {
  await nextTick()
  if (!academicChart.value) return
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  const ctx = academicChart.value.getContext('2d')
  const isDark = document.documentElement.classList.contains('dark-mode') ||
                 document.body.classList.contains('dark-mode')
  const textColor = isDark ? '#9CA3AF' : '#4B5563'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const tooltipBg = isDark ? 'rgba(17,24,39,0.95)' : 'rgba(15,15,30,0.88)'

  const labels = academicProgress.value.map(r => r.expected_semester_label.replace('Semester ', 'S').replace(' - Year ', '/Y'))
  const gpas = academicProgress.value.map(r => r.gpa ?? 0)

  const backgroundColors = academicProgress.value.map(r => {
    if (r.status === 'Not Recorded') return isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.05)'
    if (r.verification_status === 'rejected') return 'rgba(239, 68, 68, 0.2)'
    if (r.verification_status === 'pending') return 'rgba(245, 158, 11, 0.2)'
    
    // Verified High Performance
    if (r.gpa >= 4.0) return 'rgba(34, 197, 94, 0.3)'
    return isDark ? 'rgba(107, 89, 255, 0.3)' : 'rgba(107, 89, 255, 0.2)'
  })

  const borderColors = academicProgress.value.map(r => {
    if (r.status === 'Not Recorded') return isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.1)'
    if (r.verification_status === 'rejected') return '#ef444465'
    if (r.verification_status === 'pending') return '#f59e0b65'
    if (r.gpa >= 4.0) return '#22c55e65'
    return '#6B59FF65'
  })

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Semester GPA',
        data: gpas,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 'flex',
        maxBarThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBg,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const record = academicProgress.value[context.dataIndex]
              if (record.status === 'Not Recorded') return ' Not Recorded'
              let label = ` GPA: ${record.gpa}`
              if (record.verification_status) label += ` (${record.verification_status})`
              return label
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5.0,
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: textColor, font: { size: 10 }, stepSize: 1 }
        },
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { size: 9 } }
        }
      }
    }
  })
}

watch(academicProgress, () => {
  renderAcademicChart()
}, { deep: true })

onMounted(async () => {
  try {
    const savedData = localStorage.getItem('student_session')
    
    if (savedData) {
      const parsed = JSON.parse(savedData)
      const id = parsed.id
      studentData.value = parsed // Show cached instantly
      
      // Fetch rich data from Supabase
      const [studentRes, progressRes] = await Promise.all([
        getStudent(id),
        getAcademicProgress(id)
      ])
      
      if (studentRes.data) {
        studentData.value = studentRes.data
        // Update cache
        localStorage.setItem('student_session', JSON.stringify(studentRes.data))
      }
      
      if (progressRes.data) {
        academicProgress.value = progressRes.data
      }

      // Set up real-time sync for this student
      realtimeSubscription = subscribeToStudentUpdates(id, (table, payload) => {
        console.log(`Real-time update from ${table}:`, payload)
        // Refresh all data
        getStudent(id).then(({ data }) => { if (data) studentData.value = data })
        getAcademicProgress(id).then(({ data }) => { academicProgress.value = data || [] })
      })
    } else {
      router.push('/student/login')
    }
  } catch (err) {
    console.error("Failed to load student data:", err)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (realtimeSubscription) {
    realtimeSubscription.unsubscribe()
  }
})
</script>

<style scoped>
.dashboard-wrapper {
  color: var(--text-primary);
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 3rem;
}

/* Hero Section */
.hero-section {
  position: relative;
  border-radius: var(--radius-xl, 16px);
  overflow: hidden;
  background-color: var(--surface);
  border: 1px solid var(--border-primary);
  margin-top: 1rem;
}

.hero-bg {
  height: 140px;
  background-image: url('/login-bg.png');
  background-size: cover;
  background-position: center;
  position: relative;
  background-color: var(--border-primary);
}

.hero-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  filter: blur(8px) brightness(0.6);
  transform: scale(1.1);
}
.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%);
}

.hero-content {
  position: relative;
  padding: 0 2rem 2rem;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-top: -45px;
}

.avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--surface);
  background-color: var(--surface);
  box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.05));
  overflow: hidden;
  flex-shrink: 0;
  z-index: 2;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-info {
  flex-grow: 1;
  padding-bottom:.5rem 0;
  z-index: 2;
}

.badge-row {
  margin-bottom: 0.5rem;
}

.premium-badge {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.beneficiary-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.3rem 0;
  color: var(--text-primary);
}

.academic-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.edit-profile button{
  
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s ease);
}
.edit-profile button:hover {
  background-color: var(--color-primary);
  color: #fff;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s ease);
}
.edit-profile button i{
  margin-right: 0.5rem;
  
}
.edit-profile button:hover i{
  color: #fff;
}


/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

.metric-card {
  background-color: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg, 12px);
  padding: 1rem;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.02));
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.05));
}

.wallet-card {
  background: linear-gradient(135deg, var(--color-primary), #4834d4);
  color: white;
  border: none;
}

.wallet-card .card-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.wallet-card .icon-box-sm.glass {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.wallet-balance {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 1rem 0;
  letter-spacing: -1px;
}

.wallet-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
}

.fee-info {
  display: flex;
  flex-direction: column;
}

.bank-pill {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-label {
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.bg-glass {
  background: var(--bg-primary);
  color: var(--color-primary);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.progress-stats {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.stat-big {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.progress-bar-container {
  height: 8px;
  background-color: var(--border-primary);
  border-radius: 4px;
  overflow: hidden;
  margin-top: auto;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: auto;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--border-primary);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-lbl {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.info-val {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95rem;
}

/* ------ Detail Cards (from StudentDetail) ------ */
.detail-main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1rem;
}
.hide-card{
  display: none;
}
@media (max-width: 992px) {
  .detail-main-grid {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
  }
  .sidebar-col {
    order: 2;
  }
  .content-col {
    order: 1;
  }
}

@media (max-width: 768px) {
  .hide-card{
    display: block;
  }
  .show-card{
    display: none;
  }
  .edit-profile button{
    display: none;
  }
  .academic-subtitle i{
    display: none;
  }

}

/* Modal Layout Overrides for Student Dashboard */
.edit-modal-layout-new {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1rem;
}

.avatar-edit-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(107, 89, 255, 0.05) 0%, rgba(107, 89, 255, 0) 100%);
  border-radius: 20px;
}

.profile-avatar.big {
  width: 160px;
  height: 160px;
  font-size: 3.5rem;
  position: relative;
  border: 5px solid rgba(255, 255, 255, 0.384);
  box-shadow: var(--shadow-xl);
  border-radius: 30px;
  overflow: hidden;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-upload-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 1;
}

@media (max-width: 768px) {
  .edit-modal-layout-new {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.content-col, .sidebar-col {
  display: flex;
  flex-direction: column;
}

.detail-card {
  background: var(--surface);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.detail-card .card-head {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-bottom: 1px solid var(--border-primary);
  background: color-mix(in srgb, var(--color-primary) 2%, var(--surface));
}

.detail-card .between {
  justify-content: start;
}

.detail-card .card-head i {
  font-size: 1.1rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  flex-shrink: 0;
}

.detail-card .card-head h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

/* card-body scoped to detail-card to avoid wallet conflict */
.detail-card .card-body {
  padding: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .2rem;
  padding: .2rem;
  border-radius: 10px;
}

.info-grid.half {
  grid-template-columns: repeat(2, 1fr);
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  transition: background 0.2s ease;
  background: var(--bg-primary);
}

.info-group label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.info-group span {
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 600;
}

.capitalize { text-transform: capitalize; }

.remarks-box {
  background: var(--bg-primary);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.info-lbl-sm {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  display: block;
}

.remarks-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
}

.doc-links{
  display: flex;
  flex-direction: column;
  /* gap: .5rem; */
  width: 100%;
}

.doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  text-decoration: none;
  transition: all 0.25s;
  box-shadow: var(--shadow-xs);
}

.doc-item:hover {
  border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
  background: color-mix(in srgb, var(--color-primary) 3%, var(--surface));
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.doc-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.doc-icon.pdf { background: #fee2e2; color: #ef4444; }

.doc-info { display: flex; flex-direction: column; }

.doc-name { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }

.doc-meta { font-size: 0.8rem; color: var(--color-primary); font-weight: 500; margin-top: 0.15rem; }

.no-docs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  color: var(--text-muted);
  background: var(--bg-primary);
  border-radius: 12px;
  font-size: 0.9rem;
}

/* Modern Table */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: var(--bg-primary);
  text-align: left;
  padding: 1rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-primary);
}

.modern-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  font-size: 0.95rem;
  color: var(--text-primary);
  vertical-align: middle;
}

.modern-table tr:last-child td { border-bottom: none; }

.modern-table tbody tr { transition: background 0.15s ease; }

.modern-table tbody tr:hover {
  background: color-mix(in srgb, var(--color-primary) 3%, var(--surface));
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.status-dot.paid { background: #10b981; }
.status-dot.pending { background: #f59e0b; }
.status-dot.failed { background: #ef4444; }

.status-name { font-size: 0.85rem; text-transform: capitalize; font-weight: 500; }

.action-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-icon-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }

.action-icon-btn.primary { color: var(--color-primary); background: rgba(107, 89, 255, 0.1); }
.action-icon-btn.primary:hover { background: var(--color-primary); color: white; }

.empty-payments {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-payments i {
  font-size: 2.5rem;
  opacity: 0.4;
  display: block;
  margin-bottom: 0.75rem;
}

/* Academic Progress */
.academic-progress-container { margin-bottom: 1rem; }

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-info { display: flex; flex-direction: column; }

.progress-label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }

.progress-count { font-size: 0.8rem; color: var(--text-muted); }

.progress-percentage { font-size: 1.1rem; font-weight: 700; color: var(--color-primary); }

.chart-wrapper { height: 260px; margin-top: 1rem; }

/* Financial Card */
.financial-card {
  background: linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--color-primary) 2%, transparent) 100%);
}

.fin-card-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.financial-stat { display: flex; flex-direction: column; gap: 0.5rem; }

.financial-stat label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }

.stat-amount { font-size: 1.75rem; font-weight: 800; }

.stat-amount.primary { color: var(--color-primary); }
.stat-amount.blue { color: #3b82f6; }

.financial-sep { height: 1px; background: var(--border-primary); }

.bank-info {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.bank-item { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; }

.bank-item i {
  font-size: 1.25rem;
  color: var(--text-muted);
  background: var(--surface);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.bank-det { 
  display: flex; 
  flex-direction: column; 
}

.bank-name { 
  font-weight: 700; 
  color: var(--text-primary); 
  font-size: 0.95rem; 
}

.bank-acc-name { 
  font-size: 0.85rem; 
  color: var(--text-secondary); 
}

.bank-acc { 
  font-size: 0.85rem; 
  color: var(--text-muted); 
  font-family: monospace; 
  font-weight: 600; 
}

/* Academic Records */
.records-stack { 
  display: flex; 
  flex-direction: column; 
  gap: 0.5rem; 
}


.record-item:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
  background: var(--surface);
}

.record-info { 
  display: flex; 
  flex-direction: column; 
}

.sem-label { 
  font-weight: 600; 
  color: var(--text-primary); 
  font-size: 0.95rem; 
}

.record-gpa-val { 
  font-size: 0.85rem; 
  color: var(--text-muted); 
  margin-top: 0.1rem; 
}

.record-actions { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  justify-content: space-between; 
}

.record-action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  text-decoration: none;
}

.record-action-btn.view { 
  background: rgba(16, 185, 129, 0.1); 
  color: #10b981; 
}
.record-action-btn.view:hover { 
  background: #10b981; 
  color: white; 
}

.record-action-btn.delete { 
  background: rgba(239, 68, 68, 0.1); 
  color: #ef4444; 
}
.record-action-btn.delete:hover { 
  background: #ef4444; 
  color: white; 
}

.empty-records {
  background: var(--bg-primary);
  border-radius: 12px;
  border: 2px dashed var(--border-primary);
}

/* Mini Audit */
.mini-audit { 
  font-size: 0.8rem; 
  color: var(--text-muted); 
}
.mini-audit p { 
  margin: 0.2rem 0; 
}

/* card-details (wallet card) */
.card-details {
  background-color: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  overflow: hidden;
}

.card-header-title {
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-primary);
}

.card-header-title .card-icon {
  padding: .3rem .5rem;
  border-radius: 10px;
  font-size: 1.2rem;
  background-color: #4834d425;
}

.card-header-title .card-icon i {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary);
}

.card-body { padding: 1rem; }

.card-footer {
  padding: 1rem;
  border-top: 1px dashed var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  color: var(--text-primary);
}

.wallet-card .card-header-title { 
  border-bottom: none; 
}
.wallet-card .card-icon { 
  background-color: #fff; 
  color: var(--color-primary); 
}

/* Responsive */
@media (max-width: 992px) {
  .detail-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-section {
    /* padding: 1.5rem 1rem; */
    min-height: auto;
  }
  
 
  .hero-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
    padding: 1rem .5rem;
    margin-top: -65px;
  }
  
  .badge-row .premium-badge {
    background-color: #715df325;
    border: 1px solid #715df368;
    color: #9e8fff;
  }
  .badge-row i{
    color: #715df3 !important;
  }
  .avatar-wrapper {
    width: 120px;
    height: 120px;
  }

  .hero-info {
    display: flex;
    flex-direction: column; 
    align-items: center;
    text-align: center;
  }

  .beneficiary-name {
    font-size: clamp(1.75rem, 5vw, 2.5rem);
  }

  .edit-profile {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .edit-profile .btn {
    width: 100%;
    max-width: 300px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .info-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (max-width: 640px) {
  .modern-table thead { display: none; }

  .modern-table tbody tr {
    display: block;
    margin: 0.75rem 0;
    padding: 1rem;
    background: var(--surface);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    margin-bottom: 1rem;
    box-shadow: var(--shadow-sm);
  }

  .modern-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-primary);
    text-align: right;
  }

  .modern-table td:last-child {
    border-bottom: none;
    padding-bottom: 0.25rem;
  }

  .modern-table td::before {
    content: attr(data-label);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.7rem;
    color: var(--text-muted);
  }
}

/* Add / Record GPA Button */
.add-btn-sm {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn-sm:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  i{
    color: white !important;
    background-color: #e2e8f025;
  }
}

.add-btn-sm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Delete btn in academic records */
.record-action-btn.delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.record-action-btn.delete:hover {
  background: #ef4444;
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.payment-modal {
  background: var(--surface);
  border-radius: 18px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-primary);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-card-head {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-primary);
  background: color-mix(in srgb, var(--color-primary) 2%, var(--surface));
  border-radius: 18px 18px 0 0;
}

.modal-card-head.between { justify-content: space-between; }

.modal-card-head h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-card-body { 
  padding: 1.5rem; 
}

.icon-box-sm {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.icon-box-sm.success { 
  background: rgba(16, 185, 129, 0.1); 
  color: #10b981; 
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.close-btn:hover { background: #ef4444; color: white; border-color: #ef4444; }

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid var(--border-primary);
  border-radius: 10px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-section{
  margin-bottom: 2rem;
}
.custom-modal-body{
  padding: 1rem;
}
.form-control:focus { 
  outline: none; 
  border-color: var(--color-primary); 
}

.form-text { 
  font-size: 0.78rem; 
  color: var(--text-muted); 
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 1rem;
  pointer-events: none;
}
.input-with-icon .form-control { padding-left: 2.5rem; }

.semester-preview {
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 15%, transparent);
}
.semester-preview small { font-size: 0.75rem; color: var(--text-muted); display: block; }
.sem-preview-label { font-weight: 700; color: var(--color-primary); font-size: 1rem; margin-top: 0.2rem; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  background: var(--color-primary);
  color: white;
  border: none;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { 
  opacity: 0.88; 
  transform: translateY(-1px); 
}
.btn-primary:disabled { 
  opacity: 0.55; 
  cursor: not-allowed; 
}

.btn-light-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1.5px solid var(--border-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-light-secondary:hover:not(:disabled) { 
  border-color: var(--color-primary); 
  color: var(--color-primary); 
}
.btn-light-secondary:disabled { 
  opacity: 0.5; 
  cursor: not-allowed; 
}

/* Mini audit */
.mini-audit { font-size: 0.8rem; color: var(--text-muted); }
.mini-audit p { margin: 0.2rem 0; }

/* Modal transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.96); }

/* Admission Upload Styles */
.no-docs-upload {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.25rem;
  background: color-mix(in srgb, var(--color-primary) 3%, var(--surface));
  border-radius: 14px;
  border: 1px dashed color-mix(in srgb, var(--color-primary) 30%, transparent);
  width: 100% !important;
}

.no-docs-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
}

.no-docs-info i {
  color: var(--color-primary);
  font-size: 1.25rem;
}

.upload-inline-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  background: var(--color-primary);
  color: white;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.upload-inline-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary) 80%, black);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px color-mix(in srgb, var(--color-primary) 40%, transparent);
}

.upload-inline-btn i {
  font-size: 1rem;
}

.upload-inline-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Academic Status Badges */
.status-badge-sm {
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.status-badge-sm.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge-sm.verified {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-badge-sm.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.record-item {
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.2s, background 0.2s;
  flex-direction: column;
  width: 100%;  
  gap: 1rem;
}


.record-item:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.05);
}

.records-stack {
  display: flex;
  flex-direction: column;
}

/* Custom Toast Notification */
.custom-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border-primary);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  max-width: 380px;
  color: #fff;
}

.toast-success {
  border-left: 4px solid #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-icon {
  font-size: 1.5rem;
}

.toast-success .toast-icon { color: #10b981; }
.toast-error .toast-icon { color: #ef4444; }

.toast-content {
  flex: 1;
}

.toast-title {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 2px;
}

.toast-message {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  margin-top: -2px;
  font-size: 1.25rem;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #fff;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Custom Modal System (New) */
.custom-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.custom-modal-wrapper {
  background: var(--surface);
  border-radius: 24px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-primary);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
}

.custom-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: color-mix(in srgb, var(--color-primary) 3%, var(--surface));
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-titles {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.header-icon.edit-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }

.title-group {
  display: flex;
  flex-direction: column;
}

.custom-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.custom-modal-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.custom-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.custom-close-btn:hover {
  background: #ef4444;
  color: white;
}

.custom-modal-form {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.custom-modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.custom-modal-footer {
  padding: 1.25rem 2rem;
  border-top: 1px solid var(--border-primary);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: color-mix(in srgb, var(--color-primary) 1%, var(--surface));
}

.custom-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.75rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.custom-btn-outline {
  background: transparent;
  border: 1.5px solid var(--border-primary);
  color: var(--text-secondary);
}

.custom-btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.custom-btn-primary {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.custom-btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.custom-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.custom-input-group.full-width { grid-column: span 2; }

.custom-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.custom-input, .custom-select {
  width: 100%;
  padding: 0.85rem 1.1rem;
  border: 1.5px solid var(--border-primary);
  border-radius: 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s;
}

.custom-input:focus, .custom-select:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--surface);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.custom-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .custom-form-grid { 
    grid-template-columns: 1fr; 
  }
  .custom-input-group.full-width { 
    grid-column: span 1; 
  }
  .custom-modal-backdrop { 
    padding: 0.5rem; 
  }
  .custom-modal-wrapper { 
    border-radius: 16px; 
    max-height: 95vh; 
  }
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .custom-input {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: color 0.2s;
  z-index: 2;
}

.password-toggle:hover {
  color: var(--color-primary);
}

@media (max-width: 425px) {
  .custom-modal-body{
  padding: .7rem;
  }
  .custom-modal-footer{
    padding: 1rem .7rem;
    justify-content: center;
    justify-content: space-between;
  }
  .custom-modal-header{
    padding: 1rem ;
  }
  .custom-modal-header .header-icon{
    display: none;
  }
  
  
}
@media (max-width: 375px) {
  .btn-text{
    display: none;
  }
  
}

</style>

