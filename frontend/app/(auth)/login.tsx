import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

function login() {
    const [form, setForm] = useState({
        email: "",
        password: ""
    })
    const [data, setData] = useState([])

    const URL = process.env.EXPO_PUBLIC_BASE_URL

    type Form = {
        email: string;
        password: string;
    }

    const handleChanges = <K extends keyof Form>(field: K, value: Form[K]) => {
        setForm(prev => ({
            ...prev, [field]: value
        }))
    }

    const submit = async () => {

        const postData = {
            email: form.email,
            password: form.password
        }

        try {
            const response = await axios.post(`${URL}auth/login/`, postData);
            console.log(response.data)

            if (!response.data.ok) {
                console.log(response.data.error)
                return;
            }


            setData(response.data)
            setForm({
                email:"",
                password:""
            })
            await AsyncStorage.setItem('token', response.data.token)

        } catch (error) {
            console.log(error)
        }

    } 
  return (
    <View>
        <Text> This is login page.</Text>
        <View>
            <Text>
                Email
            </Text>
            <TextInput
            placeholder='Enter your email or username'
            placeholderTextColor="#999"
            value={form.email}
            onChangeText={(text) => handleChanges("email", text)}
            keyboardType='email-address'
            />
        </View>
        <View>
            <Text>
                Password
            </Text>
            <TextInput
            placeholder='enter your password'
            placeholderTextColor="#999"
            value={form.password}
            onChangeText={(text) => handleChanges("password", text)}  
            />
        </View>

        <TouchableOpacity
        onPress={submit}
        > 
        Login
        </TouchableOpacity>
    </View>
  )
}

export default login