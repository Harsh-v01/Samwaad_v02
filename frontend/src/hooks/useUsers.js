import { useEffect, useState } from 'react'

function useUsers({
  socket,
  userId,
}) {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)

  useEffect(() => {
    const handleUserList = (serverUsers = []) => {
      setUsers(
        serverUsers.filter(
          (user) => user.id !== userId
        )
      )
    }

    const handleUserJoined = (user) => {
      if (user.userId === userId) {
        return
      }

      setUsers((currentUsers) => {
        const existing = currentUsers.find(
          (item) => item.id === user.userId
        )

        if (existing) {
          return currentUsers.map((item) =>
            item.id === user.userId
              ? {
                  ...item,
                  username: user.username,
                  preferredLanguage:
                    user.preferredLanguage || 'en',
                }
              : item
          )
        }

        return [
          ...currentUsers,
          {
            id: user.userId,
            username: user.username,
            preferredLanguage:
              user.preferredLanguage || 'en',
          },
        ]
      })
    }

    const handleUserUpdated = (data) => {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === data.userId
            ? {
                ...user,
                preferredLanguage:
                  data.preferredLanguage,
              }
            : user
        )
      )
    }

    const handleUserLeft = (data) => {
      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) => user.id !== data.userId
        )
      )

      setSelectedUserId((current) =>
        current === data.userId ? null : current
      )
    }

    socket.on('user_list', handleUserList)
    socket.on('user_joined', handleUserJoined)
    socket.on('user_updated', handleUserUpdated)
    socket.on('user_left', handleUserLeft)

    return () => {
      socket.off('user_list', handleUserList)
      socket.off('user_joined', handleUserJoined)
      socket.off('user_updated', handleUserUpdated)
      socket.off('user_left', handleUserLeft)
    }
  }, [socket, userId])

  return {
    users,
    setUsers,
    selectedUserId,
    setSelectedUserId,
  }
}

export default useUsers
