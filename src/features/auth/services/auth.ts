import { supabase } from '@/services/supabase'
import { logger } from '@/utils/logger'
import { User, UserRole } from '@/types'
import { USER_ROLES, STORAGE_BUCKETS, MAX_AVATAR_SIZE, AVATAR_CACHE_CONTROL } from '@/constants'

/**
 * Signs up a new user with email and password.
 * 
 * @param email - User's email address.
 * @param password - User's password.
 * @param displayName - User's display name.
 * @returns A Promise resolving to the created User object.
 * @throws Error if signup fails.
 */
export const signup = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Failed to create user')
  }

  // User profile is created automatically by trigger, but let's ensure it exists
  // Note: userData is not used, but kept for type reference

  // Update user profile (trigger should have created it)
  // New users default to 'user' role
  const { error: profileError } = await supabase
    .from('users')
    .upsert({
      id: authData.user.id,
      email: authData.user.email || email,
      display_name: displayName,
      role: USER_ROLES.USER, // Default role for new users
    })

  if (profileError) {
    logger.error('Error creating user profile in signup', profileError, { userId: authData.user.id })
    // Continue anyway as trigger should handle it
  }

  // Fetch the created user with role
  const { data: createdUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  return {
    uid: authData.user.id,
    email: createdUser?.email || authData.user.email || email,
    displayName: createdUser?.display_name || displayName,
    avatar: createdUser?.avatar || undefined,
    role: (createdUser?.role as UserRole) || USER_ROLES.USER,
    createdAt: createdUser ? new Date(createdUser.created_at) : new Date(),
  }
}

/**
 * Login with email and password
 * 
 * Flow:
 * 1. Authenticate with Supabase Auth
 * 2. Fetch user profile from database
 * 3. Create profile if missing (backup for trigger failures)
 * 4. Return user object
 * 
 * @param email - User's email.
 * @param password - User's password.
 * @returns A Promise resolving to the authenticated User object.
 * @throws Error if authentication fails.
 */
export const login = async (email: string, password: string): Promise<User> => {
  // Step 1: Authenticate with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Handle authentication errors with specific messages
  if (authError) {
    // Provide user-friendly error messages
    if (authError.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password. Please try again.')
    }
    if (authError.message.includes('Email not confirmed')) {
      throw new Error('Please confirm your email before logging in.')
    }
    throw new Error(authError.message || 'Authentication failed')
  }

  if (!authData.user) {
    throw new Error('Login failed - no user returned')
  }

  // Step 2: Fetch user profile from database
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  // Step 3: Create profile if it doesn't exist (trigger might not have fired)
  if (profileError || !userProfile) {
    logger.warn('[Auth] User profile not found, creating...', { userId: authData.user.id, error: profileError })

    const { error: createError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email || email,
        display_name: authData.user.user_metadata?.display_name || authData.user.email || email,
        role: USER_ROLES.USER, // Default role
      })

    if (createError) {
      logger.error('[Auth] Failed to create user profile in login', createError, { userId: authData.user.id })
      // Still return user info even if profile creation fails
      return {
        uid: authData.user.id,
        email: authData.user.email || email,
        displayName: authData.user.user_metadata?.display_name || email,
        avatar: undefined,
        role: USER_ROLES.USER as UserRole,
        createdAt: new Date(),
      }
    }

    // Fetch the newly created profile
    const { data: newProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (newProfile) {
      return {
        uid: newProfile.id,
        email: newProfile.email,
        displayName: newProfile.display_name || newProfile.email,
        avatar: newProfile.avatar || undefined,
        role: (newProfile.role as UserRole) || USER_ROLES.USER,
        createdAt: new Date(newProfile.created_at),
      }
    }

    // Fallback if profile fetch still fails
    return {
      uid: authData.user.id,
      email: authData.user.email || email,
      displayName: authData.user.user_metadata?.display_name || email,
      avatar: undefined,
      role: USER_ROLES.USER as UserRole,
      createdAt: new Date(),
    }
  }

  // Step 4: Return user profile with role
  return {
    uid: userProfile.id,
    email: userProfile.email,
    displayName: userProfile.display_name || userProfile.email,
    avatar: userProfile.avatar || undefined,
    role: (userProfile.role as UserRole) || USER_ROLES.USER,
    createdAt: new Date(userProfile.created_at),
  }
}

/**
 * Logs out the current user.
 * @throws Error if logout fails.
 */
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Retrieves the current authenticated user.
 * 
 * @param userId - The UUID of the user.
 * @returns A Promise resolving to the User object or null if not found.
 */
export const getCurrentUser = async (userId: string): Promise<User | null> => {
  try {
    // First get auth user info
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      logger.error('Error getting auth user', authError)
      return null
    }

    // Then get profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // If profile doesn't exist, create it (might happen if trigger didn't fire)
    if (profileError || !userProfile) {
      logger.warn('User profile not found in getCurrentUser, creating...', { userId, error: profileError })

      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email || '',
          display_name: authUser.user_metadata?.display_name || authUser.email || '',
          role: USER_ROLES.USER, // Default role
        })

      if (createError) {
        logger.error('Error creating user profile in getCurrentUser', createError, { userId })
        // Return basic user info even if profile creation fails
        return {
          uid: authUser.id,
          email: authUser.email || '',
          displayName: authUser.user_metadata?.display_name || authUser.email || '',
          role: USER_ROLES.USER as UserRole,
          createdAt: new Date(),
        }
      }

      // Retry fetching after creation
      const { data: newProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (newProfile) {
        return {
          uid: newProfile.id,
          email: newProfile.email,
          displayName: newProfile.display_name || newProfile.email,
          avatar: newProfile.avatar || undefined,
          role: (newProfile.role as UserRole) || USER_ROLES.USER,
          createdAt: new Date(newProfile.created_at),
        }
      }
    }

    // Return existing profile with role
    return {
      uid: userProfile.id,
      email: userProfile.email,
      displayName: userProfile.display_name || userProfile.email,
      avatar: userProfile.avatar || undefined,
      role: (userProfile.role as UserRole) || USER_ROLES.USER,
      createdAt: new Date(userProfile.created_at),
    }
  } catch (error) {
    logger.error('Error getting current user', error, { userId })
    return null
  }
}

/**
 * Request password reset email
 * 
 * Sends a password reset email to the user.
 * The email contains a link to reset the password.
 * 
 * @param email - The email address to send the reset link to.
 * @throws Error if sending fails.
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  // Guard for SSR - use environment variable or fallback
  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : (import.meta.env.VITE_APP_URL || 'https://your-domain.com')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    throw new Error(error.message || 'Failed to send password reset email')
  }
}

/**
 * Reset password with new password
 * 
 * Updates the user's password using the reset token from the email.
 * 
 * @param newPassword - The new password.
 * @throws Error if reset fails.
 */
export const resetPassword = async (newPassword: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(error.message || 'Failed to reset password')
  }
}

/**
 * Update user profile
 * 
 * Updates the user's display name and/or avatar.
 * 
 * @param updates - Object containing displayName and/or avatar URL.
 * @returns A Promise resolving to the updated User object.
 * @throws Error if update fails or user is not authenticated.
 */
export const updateProfile = async (
  updates: { displayName?: string; avatar?: string }
): Promise<User> => {
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    throw new Error('Not authenticated')
  }

  const updateData: { display_name?: string; avatar?: string } = {}
  if (updates.displayName !== undefined) {
    updateData.display_name = updates.displayName
  }
  if (updates.avatar !== undefined) {
    updateData.avatar = updates.avatar
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', authUser.id)

  if (error) {
    throw new Error(error.message || 'Failed to update profile')
  }

  // Update auth metadata
  if (updates.displayName) {
    await supabase.auth.updateUser({
      data: { display_name: updates.displayName },
    })
  }

  // Return updated user
  const user = await getCurrentUser(authUser.id)
  if (!user) {
    throw new Error('Failed to fetch updated user')
  }

  return user
}

/**
 * Upload avatar image
 * 
 * Uploads an avatar image to Supabase Storage and returns the public URL.
 * 
 * @param file - The image file to upload.
 * @returns A Promise resolving to the public URL of the uploaded avatar.
 * @throws Error if upload fails, file is invalid, or user is not authenticated.
 */
export const uploadAvatar = async (file: File): Promise<string> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  // Validate file size (max 5MB)
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error('Image must be less than 5MB')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATAR_IMAGES)
    .upload(fileName, file, {
      cacheControl: AVATAR_CACHE_CONTROL,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload avatar')
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.AVATAR_IMAGES)
    .getPublicUrl(fileName)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get avatar URL')
  }

  return urlData.publicUrl
}

/**
 * Subscribes to authentication state changes.
 * 
 * @param callback - Function to call when auth state changes.
 * @returns Unsubscribe function.
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  // Don't call callback immediately - let initializeAuth handle initial state
  // Only listen to future auth state changes

  // Listen to auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      try {
        const user = await getCurrentUser(session.user.id)
        callback(user)
      } catch (error) {
        logger.error('[Auth] Error getting current user in auth change', error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })

  // Return unsubscribe function
  return () => {
    if (subscription) {
      subscription.unsubscribe()
    }
  }
}