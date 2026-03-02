import React, { useState, useEffect } from 'react'
import { User, Mail, Book, Phone, Calendar } from 'lucide-react'

export const StudentProfileForm = ({ walletAddress, onSave, initialData = null, isLocked = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    dateOfBirth: '',
    admissionNumber: '',
    mobileNumber: '',
    department: '',
    yearOfStudy: '',
    university: 'Default University',
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Load existing data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData })
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name required'
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email required'
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email'
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth required'
    if (!formData.admissionNumber.trim()) newErrors.admissionNumber = 'Admission number required'
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number required'
    if (!formData.mobileNumber.match(/^[0-9\-\+\s\(\)]{10,}$/)) {
      newErrors.mobileNumber = 'Invalid phone number'
    }
    if (!formData.department.trim()) newErrors.department = 'Department required'
    if (!formData.yearOfStudy) newErrors.yearOfStudy = 'Year of study required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // Save to localStorage
      const storageKey = `student_profile_${walletAddress}`
      localStorage.setItem(storageKey, JSON.stringify(formData))

      // Optionally send to backend
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/credentials/student/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            ...formData,
          }),
        })
      } catch {
        // Backend endpoint optional, continue without it
      }

      // Call parent callback
      onSave(formData)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isLocked ? '✓ Your Profile' : 'Complete Your Profile'}
        </h2>
        {isLocked ? (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <p className="text-indigo-300 text-sm font-medium">
              [LOCKED] Your profile is locked. Once you receive your first credential, your profile information cannot be edited to maintain credential integrity and prevent fraud.
            </p>
          </div>
        ) : (
          <p className="text-secondary text-sm">
            This information will be used to issue your academic credentials and verify your identity.
          </p>
        )}
      </div>

      {/* Personal Information Section */}
      <div className="border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <User size={18} />
          Personal Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              disabled={isLocked}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isLocked ? 'bg-white/5 text-muted cursor-not-allowed border-white/10' : 'bg-white/5 border-white/10 text-white'
              } ${
                errors.fullName ? 'border-red-500/50' : ''
              }`}
            />
            {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Student ID Number *
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g., STU-2024-001"
              disabled={isLocked}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLocked ? 'bg-white/5 text-gray-500 cursor-not-allowed' : ''
              } ${
                errors.studentId ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {errors.studentId && <p className="text-red-400 text-xs mt-1">{errors.studentId}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={isLocked}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLocked ? 'bg-white/5 text-gray-500 cursor-not-allowed' : ''
              } ${
                errors.dateOfBirth ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {errors.dateOfBirth && (
              <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Admission Number */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Admission Number *
            </label>
            <input
              type="text"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={handleChange}
              placeholder="e.g., ADM-2024-001"
              disabled={isLocked}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLocked ? 'bg-white/5 text-gray-500 cursor-not-allowed' : ''
              } ${
                errors.admissionNumber ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {errors.admissionNumber && (
              <p className="text-red-400 text-xs mt-1">{errors.admissionNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Mail size={18} />
          Contact Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Official University Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., john.doe@university.edu"
              disabled={isLocked}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLocked ? 'bg-white/5 text-gray-500 cursor-not-allowed' : ''
              } ${
                errors.email ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="e.g., +1-555-0100"
              disabled={isLocked}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLocked ? 'bg-white/5 text-gray-500 cursor-not-allowed' : ''
              } ${
                errors.mobileNumber ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {errors.mobileNumber && (
              <p className="text-red-400 text-xs mt-1">{errors.mobileNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Academic Information Section */}
      <div className="border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Book size={18} />
          Academic Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={isLocked}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/5 border-white/10 text-white ${
                isLocked ? 'text-gray-500 cursor-not-allowed' : ''
              } ${
                errors.department ? 'border-red-500' : ''
              }`}
            >
              <option value="" className="bg-[#16161F] text-white">Select Department</option>
              <option value="Computer Science" className="bg-[#16161F] text-white">Computer Science</option>
              <option value="Engineering" className="bg-[#16161F] text-white">Engineering</option>
              <option value="Business" className="bg-[#16161F] text-white">Business</option>
              <option value="Law" className="bg-[#16161F] text-white">Law</option>
              <option value="Medicine" className="bg-[#16161F] text-white">Medicine</option>
              <option value="Arts" className="bg-[#16161F] text-white">Arts</option>
              <option value="Science" className="bg-[#16161F] text-white">Science</option>
              <option value="Other" className="bg-[#16161F] text-white">Other</option>
            </select>
            {errors.department && (
              <p className="text-red-400 text-xs mt-1">{errors.department}</p>
            )}
          </div>

          {/* Year of Study */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Year of Study *
            </label>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              disabled={isLocked}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/5 border-white/10 text-white ${
                isLocked ? 'text-gray-500 cursor-not-allowed' : ''
              } ${
                errors.yearOfStudy ? 'border-red-500' : ''
              }`}
            >
              <option value="" className="bg-[#16161F] text-white">Select Year</option>
              <option value="1st Year" className="bg-[#16161F] text-white">1st Year</option>
              <option value="2nd Year" className="bg-[#16161F] text-white">2nd Year</option>
              <option value="3rd Year" className="bg-[#16161F] text-white">3rd Year</option>
              <option value="4th Year" className="bg-[#16161F] text-white">4th Year</option>
              <option value="Graduated" className="bg-[#16161F] text-white">Graduated</option>
            </select>
            {errors.yearOfStudy && (
              <p className="text-red-400 text-xs mt-1">{errors.yearOfStudy}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      {!isLocked && (
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving Profile...
            </>
          ) : (
            'Save Profile & Continue'
          )}
        </button>
      )}

      {/* Privacy Note */}
      <p className="text-xs text-muted text-center">
        Your information is protected and will only be used for credential issuance and identity verification.
      </p>
    </form>
  )
}
