import React, { useState, useEffect } from 'react'
import { User, Mail, Book, Phone, Calendar } from 'lucide-react'

export const StudentProfileForm = ({ walletAddress, onSave, initialData = null }) => {
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
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/profile`, {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600 text-sm">
          This information will be used to issue your academic credentials and verify your identity.
        </p>
      </div>

      {/* Personal Information Section */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <User size={18} />
          Personal Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID Number *
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g., STU-2024-001"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.studentId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Admission Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Number *
            </label>
            <input
              type="text"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={handleChange}
              placeholder="e.g., ADM-2024-001"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.admissionNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.admissionNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.admissionNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Mail size={18} />
          Contact Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Official University Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., john.doe@university.edu"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="e.g., +1-555-0100"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Academic Information Section */}
      <div className="pb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Book size={18} />
          Academic Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.department ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Law">Law</option>
              <option value="Medicine">Medicine</option>
              <option value="Arts">Arts</option>
              <option value="Science">Science</option>
              <option value="Other">Other</option>
            </select>
            {errors.department && (
              <p className="text-red-500 text-xs mt-1">{errors.department}</p>
            )}
          </div>

          {/* Year of Study */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year of Study *
            </label>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.yearOfStudy ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Graduated">Graduated</option>
            </select>
            {errors.yearOfStudy && (
              <p className="text-red-500 text-xs mt-1">{errors.yearOfStudy}</p>
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

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 text-center">
        Your information is protected and will only be used for credential issuance and identity verification.
      </p>
    </form>
  )
}
