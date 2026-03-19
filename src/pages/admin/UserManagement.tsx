"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Users, Search, Filter, Key, Shield, X, Eye, EyeOff, UserPlus } from "lucide-react"
import { getUsers, adminChangePassword, changeUserRole, adminCreateUser } from "../../services/api"
import { useUser } from "../../context/UserContext"

interface User {
  id: string
  name: string
  email: string
  role: string
  status?: string
  avatar?: string
  department?: string
  licenseNumber?: string
  flightHours?: number
  phone?: string
}

interface UserManagementProps {
  darkMode?: boolean
}

const UserManagement: React.FC<UserManagementProps> = ({ darkMode }) => {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")

  const [showAddModal, setShowAddModal] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "ADMIN",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [newRole, setNewRole] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const { user, accessToken, isLoading: userLoading } = useUser()

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) // Máximo 2 iniciales
  }

  // Cargar usuarios desde la API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)

        if (userLoading) {
          return // Esperar a que termine de cargar el usuario
        }

        if (!user || !accessToken) {
          setError("No hay token de autenticación")
          return
        }

        console.log("=== Cargando usuarios desde API ===")
        const response = await getUsers(accessToken)
        console.log("Usuarios recibidos:", response)

        // Mapear los datos de la API al formato esperado
        const mappedUsers = response.map((user: any) => ({
          id: user.id,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.email || "",
          role: user.role ? user.role.toLowerCase() : "operator",
          status: user.active ? "active" : "inactive", // Usar 'active' en lugar de 'isActive'
          avatar: user.profileImage || null,
          department: user.department || null,
          licenseNumber: user.licenseNumber || null,
          flightHours: user.flightHours || null,
          phone: user.phone || null,
        }))

        console.log("Usuarios mapeados:", mappedUsers)

        setUsers(mappedUsers)
        setFilteredUsers(mappedUsers)
        setError(null)
      } catch (error) {
        console.error("Error cargando usuarios:", error)
        setError("Error al cargar usuarios. Intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    if (!userLoading && user && accessToken) {
      loadUsers()
    }
  }, [userLoading, user, accessToken])

  // Filtrar usuarios
  useEffect(() => {
    let result = users

    // Filtrar por término de búsqueda
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.licenseNumber && user.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filtrar por rol
    if (selectedRole !== "all") {
      result = result.filter((user) => user.role === selectedRole)
    }

    setFilteredUsers(result)
  }, [searchTerm, selectedRole, users])

  // Crear usuario
  const handleCreateUser = async () => {
    if (!accessToken) return
    const { firstName, lastName, email, phone, password } = newUserForm

    if (!firstName || !lastName || !email || !phone || !password) {
      setError("Todos los campos son obligatorios")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      setActionLoading(true)
      setError(null)
      await adminCreateUser(newUserForm, accessToken)
      await reloadUsers()
      setShowAddModal(false)
      setNewUserForm({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "ADMIN" })
      setSuccessMessage(`Usuario ${firstName} ${lastName} creado correctamente`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || "Error al crear usuario")
    } finally {
      setActionLoading(false)
    }
  }

  // Temporalmente comentadas las funciones de edición y eliminación
  /*
  const handleEditUser = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      if (!accessToken) {
        setError("No hay token de autenticación")
        return
      }

      // Preparar datos para la API
      const [firstName, ...lastNameParts] = currentUser.name.split(" ")
      const lastName = lastNameParts.join(" ")

      const updateData = {
        firstName,
        lastName,
        email: currentUser.email,
        phone: currentUser.phone || undefined,
        role: currentUser.role.toUpperCase(),
        active: currentUser.status === "active", // Cambiar 'isActive' por 'active'
      }

      console.log("=== Actualizando usuario ===", updateData)
      await updateUser(currentUser.id, updateData, accessToken)

      // Recargar usuarios después de actualizar
      const response = await getUsers(accessToken)
      const mappedUsers = response.map((user: any) => ({
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        role: user.role ? user.role.toLowerCase() : "operator",
        status: user.active ? "active" : "inactive", // Usar 'active' en lugar de 'isActive'
        avatar: user.profileImage || null,
        department: user.department || null,
        licenseNumber: user.licenseNumber || null,
        flightHours: user.flightHours || null,
        phone: user.phone || null,
      }))

      setUsers(mappedUsers)
      setShowEditModal(false)
      setCurrentUser(null)
      setError(null)
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      setError("Error al actualizar usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      if (!accessToken) {
        setError("No hay token de autenticación")
        return
      }

      console.log("=== Desactivando usuario ===", currentUser.id)
      await deleteUser(currentUser.id, accessToken)

      // Recargar usuarios después de desactivar
      const response = await getUsers(accessToken)
      const mappedUsers = response.map((user: any) => ({
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        role: user.role ? user.role.toLowerCase() : "operator",
        status: user.active ? "active" : "inactive", // Usar 'active' en lugar de 'isActive'
        avatar: user.profileImage || null,
        department: user.department || null,
        licenseNumber: user.licenseNumber || null,
        flightHours: user.flightHours || null,
        phone: user.phone || null,
      }))

      setUsers(mappedUsers)
      setShowDeleteModal(false)
      setCurrentUser(null)
      setError(null)
    } catch (error) {
      console.error("Error desactivando usuario:", error)
      setError("Error al desactivar usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateUser = async (userId: string) => {
    try {
      setLoading(true)
      if (!accessToken) {
        setError("No hay token de autenticación")
        return
      }

      const userToReactivate = users.find((u) => u.id === userId)
      if (!userToReactivate) return

      const [firstName, ...lastNameParts] = userToReactivate.name.split(" ")
      const lastName = lastNameParts.join(" ")

      const updateData = {
        firstName,
        lastName,
        email: userToReactivate.email,
        phone: userToReactivate.phone || undefined,
        role: userToReactivate.role.toUpperCase(),
        active: true, // Cambiar 'isActive' por 'active'
      }

      console.log("=== Reactivando usuario ===", updateData)
      await updateUser(userId, updateData, accessToken)

      // Recargar usuarios después de reactivar
      const response = await getUsers(accessToken)
      const mappedUsers = response.map((user: any) => ({
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        role: user.role ? user.role.toLowerCase() : "operator",
        status: user.active ? "active" : "inactive", // Usar 'active' en lugar de 'isActive'
        avatar: user.profileImage || null,
        department: user.department || null,
        licenseNumber: user.licenseNumber || null,
        flightHours: user.flightHours || null,
        phone: user.phone || null,
      }))

      setUsers(mappedUsers)
      setError(null)
    } catch (error) {
      console.error("Error reactivando usuario:", error)
      setError("Error al reactivar usuario")
    } finally {
      setLoading(false)
    }
  }
  */

  // Recargar usuarios desde la API
  const reloadUsers = async () => {
    if (!accessToken) return
    const response = await getUsers(accessToken)
    const mappedUsers = response.map((u: any) => ({
      id: u.id,
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      email: u.email || "",
      role: u.role ? u.role.toLowerCase() : "operator",
      status: u.active ? "active" : "inactive",
      avatar: u.profileImage || null,
      department: u.department || null,
      licenseNumber: u.licenseNumber || null,
      flightHours: u.flightHours || null,
      phone: u.phone || null,
    }))
    setUsers(mappedUsers)
    setFilteredUsers(mappedUsers)
  }

  // Cambiar contraseña de usuario
  const handleChangePassword = async () => {
    if (!selectedUser || !accessToken) return

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    try {
      setActionLoading(true)
      setError(null)
      await adminChangePassword(Number(selectedUser.id), newPassword, accessToken)
      setShowPasswordModal(false)
      setNewPassword("")
      setConfirmPassword("")
      setShowPassword(false)
      setSuccessMessage(`Contraseña de ${selectedUser.name} actualizada correctamente`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || "Error al cambiar contraseña")
    } finally {
      setActionLoading(false)
    }
  }

  // Cambiar rol de usuario
  const handleChangeRole = async () => {
    if (!selectedUser || !accessToken || !newRole) return

    try {
      setActionLoading(true)
      setError(null)
      await changeUserRole(Number(selectedUser.id), newRole.toUpperCase(), accessToken)
      await reloadUsers()
      setShowRoleModal(false)
      setSuccessMessage(`Rol de ${selectedUser.name} actualizado correctamente`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || "Error al cambiar rol")
    } finally {
      setActionLoading(false)
    }
  }

  // Obtener el color de fondo según el rol
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "pilot":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "operator":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "technician":
      case "tecnico":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "ground_support":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Obtener el texto del rol en español
  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "pilot":
        return "Piloto"
      case "operator":
        return "Operador"
      case "technician":
      case "tecnico":
        return "Técnico"
      case "ground_support":
        return "Apoyo en Tierra"
      default:
        return role
    }
  }

  return (
    <div className="pt-6">
      <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
            <Users className="inline mr-2" size={24} />
            Gestión de Usuarios
          </h1>
          <button
            onClick={() => {
              setNewUserForm({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "ADMIN" })
              setError(null)
              setShowAddModal(true)
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <UserPlus size={18} className="mr-2" />
            Nuevo Usuario
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar usuario..."
              className={`w-full pl-10 pr-4 py-2 rounded-md border ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className={`absolute left-3 top-2.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} size={18} />
          </div>
          <div className="flex gap-2">
            <select
              className={`px-4 py-2 rounded-md border ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
              }`}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="pilot">Piloto</option>
              <option value="tecnico">Técnico</option>
              <option value="ground_support">Apoyo en Tierra</option>
            </select>
            <button
              className={`px-4 py-2 rounded-md border flex items-center ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Filter size={18} className="mr-2" />
              Filtros
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  Usuario
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  Rol
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  Estado
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      <span className="ml-2">Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <div className="text-red-600 mb-2">{error}</div>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-orange-600 hover:text-orange-700 underline"
                    >
                      Reintentar
                    </button>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={darkMode ? "bg-gray-800" : "bg-white"}>
                    <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">{getInitials(user.name)}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{user.name}</div>
                          <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                            {user.email}
                            {user.licenseNumber && <div>Licencia: {user.licenseNumber}</div>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(
                          user.role,
                        )}`}
                      >
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status === "active" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setNewPassword("")
                          setConfirmPassword("")
                          setShowPassword(false)
                          setError(null)
                          setShowPasswordModal(true)
                        }}
                        className="text-orange-600 hover:text-orange-900 mr-3 inline-flex items-center"
                        title="Cambiar contraseña"
                      >
                        <Key size={16} className="mr-1" />
                        Contraseña
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setNewRole(user.role)
                          setError(null)
                          setShowRoleModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        title="Cambiar rol"
                      >
                        <Shield size={16} className="mr-1" />
                        Rol
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm">
                    No se encontraron usuarios con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear usuario */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md p-6 rounded-lg shadow-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Nuevo Usuario</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 rounded-md border ${
                      darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                    }`}
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido *</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 rounded-md border ${
                      darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                    }`}
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono *</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="+5491155551234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contraseña *</label>
                <input
                  type="password"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rol *</label>
                <select
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="PILOT">Piloto</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="GROUND_SUPPORT">Apoyo en Tierra</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Creando..." : "Crear Usuario"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md p-6 rounded-lg shadow-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cambiar Contraseña</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <p className={`mb-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Cambiar contraseña de <strong>{selectedUser.name}</strong> ({selectedUser.email})
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    className={`w-full px-4 py-2 pr-10 rounded-md border ${
                      darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                    }`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirmar Contraseña *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  } ${confirmPassword && newPassword !== confirmPassword ? "border-red-500" : ""}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir contraseña"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={actionLoading || !newPassword || newPassword !== confirmPassword}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Guardando..." : "Cambiar Contraseña"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cambiar rol */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md p-6 rounded-lg shadow-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cambiar Rol</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <p className={`mb-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Cambiar rol de <strong>{selectedUser.name}</strong> ({selectedUser.email})
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="changeRole" className="block text-sm font-medium mb-1">
                  Nuevo Rol *
                </label>
                <select
                  id="changeRole"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="admin">Administrador</option>
                  <option value="pilot">Piloto</option>
                  <option value="tecnico">Técnico</option>
                  <option value="ground_support">Apoyo en Tierra</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeRole}
                  disabled={actionLoading || newRole === selectedUser.role}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Guardando..." : "Cambiar Rol"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comentado temporalmente - Modal para añadir usuario
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md p-6 rounded-lg shadow-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Nuevo Usuario</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="name"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="newRole" className="block text-sm font-medium mb-1">
                  Rol *
                </label>
                <select
                  id="newRole"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  required
                >
                  <option value="admin">Administrador</option>
                  <option value="pilot">Piloto</option>
                  <option value="operator">Operador</option>
                  <option value="technician">Técnico</option>
                </select>
              </div>

              {newUser.role === "pilot" && (
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">
                    Número de Licencia
                  </label>
                  <input
                    type="text"
                    id="licenseNumber"
                    className={`w-full px-4 py-2 rounded-md border ${
                      darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                    }`}
                    value={newUser.licenseNumber || ""}
                    onChange={(e) => setNewUser({ ...newUser, licenseNumber: e.target.value })}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      */}

      {/* Temporalmente comentados los modales de edición y eliminación
      {showEditModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md p-6 rounded-lg shadow-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Editar Usuario</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="editName"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="editEmail"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="editRole" className="block text-sm font-medium mb-1">
                  Rol *
                </label>
                <select
                  id="editRole"
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  }`}
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                  required
                >
                  <option value="admin">Administrador</option>
                  <option value="pilot">Piloto</option>
                  <option value="operator">Operador</option>
                  <option value="technician">Técnico</option>
                </select>
              </div>

              {currentUser.role === "pilot" && (
                <div>
                  <label htmlFor="editLicenseNumber" className="block text-sm font-medium mb-1">
                    Número de Licencia
                  </label>
                  <input
                    type="text"
                    id="editLicenseNumber"
                    className={`w-full px-4 py-2 rounded-md border ${
                      darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                    }`}
                    value={currentUser.licenseNumber || ""}
                    onChange={(e) => setCurrentUser({ ...currentUser, licenseNumber: e.target.value })}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditUser}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md p-6 rounded-lg shadow-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Confirmar Desactivación</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <p className="mb-6">
              ¿Está seguro que desea desactivar al usuario <strong>{currentUser.name}</strong>? Esta acción no elimina
              al usuario del sistema, solo lo desactiva.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 rounded-md ${
                  darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  )
}

export default UserManagement
