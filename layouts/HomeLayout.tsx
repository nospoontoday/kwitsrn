import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'

const HomeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SafeAreaView>
      <Text>HomeLayout</Text>
    </SafeAreaView>
  )
}

export default HomeLayout'