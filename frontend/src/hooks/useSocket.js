import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import socket from '../services/socket'

function useSocket() {
  const [connected, setConnected] =
    useState(socket.connected)

  useEffect(() => {
    const handleConnect = () => {
      console.log('Samvad socket connected:', socket.id)
      setConnected(true)
    }

    const handleDisconnect = () => {
      console.log('Samvad socket disconnected')
      setConnected(false)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [])

  const emit = useCallback((event, data) => {
    if (!socket.connected) {
      return false
    }

    socket.emit(event, data)
    return true
  }, [])

  const on = useCallback((event, handler) => {
    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
    }
  }, [])

  const connect = useCallback(() => {
    if (!socket.connected) {
      socket.connect()
    }
  }, [])

  const disconnect = useCallback(() => {
    if (socket.connected) {
      socket.disconnect()
    }
  }, [])

  return {
    socket,
    connected,
    socketId: socket.id,
    emit,
    on,
    connect,
    disconnect,
  }
}

export default useSocket
