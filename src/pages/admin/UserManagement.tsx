"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Users, Search, Filter } from "lucide-react"
import { getUsers } from "../../services/api"
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

  // Comentado temporalmente - Estados del modal de creación
  // const [showAddModal, setShowAddModal] = useState(false)
  // const [newUser, setNewUser] = useState<Partial<User>>({
  //   name: "",
  //   email: "",
  //   role: "pilot",
  //   status: "active",
  // })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Comentado temporalmente - Función de creación de usuarios
  // const handleAddUser = () => {
  //   if (!newUser.name || !newUser.email || !newUser.role) {
  //     alert("Por favor complete todos los campos obligatorios")
  //     return
  //   }

  //   const userToAdd = {
  //     ...newUser,
  //     id: `user${users.length + 1}`,
  //     status: "active",
  //   } as User

  //   setUsers([...users, userToAdd])
  //   setShowAddModal(false)
  //   setNewUser({
  //     name: "",
  //     email: "",
  //     role: "pilot",
  //     status: "active",
  //   })
  // }

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
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
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
        return "Técnico"
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
          {/* Comentado temporalmente - Botón de crear usuario
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <UserPlus size={18} className="mr-2" />
            Nuevo Usuario
          </button>
          */}
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
              <option value="operator">Operador</option>
              <option value="technician">Técnico</option>
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
                      {/* Temporalmente comentado - botones de acción
                      {user.status === "active" ? (
                        <>
                          <button
                            onClick={() => {
                              setCurrentUser(user)
                              setShowEditModal(true)
                            }}
                            className="text-orange-600 hover:text-orange-900 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setCurrentUser(user)
                              setShowDeleteModal(true)
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Desactivar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReactivateUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Reactivar"
                        >
                          Activar
                        </button>
                      )}
                      */}
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
