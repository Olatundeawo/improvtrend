import axios from 'axios'
import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function register() {
    const [data, setData] = useState()
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: ""
    })
    const URL = process.env.EXPO_PUBLIC_BASE_URL
    type Form = {
        email: string;
        username: string;
        password: string
    }

    const handleChange =<K extends keyof Form> ( field: K, value:Form[K]) => {
        setForm(prev => ({
            ...prev, [field]:value
        }))
    }

    const handleSubmit = async () => {
        const dataPost = {
            email: form.email,
            username: form.username,
            password: form.password
        }

        try {
            const response = await axios.post(`${URL}auth/register/`, dataPost);

            if(!response.data.ok) {
                console.log("Error:", response.data.error)
            }
            setData(response.data)
            setForm({
                email: "",
                username: "",
                password: ""
            })
        } catch (error) {
            
        }
    }
  return (
    <View>
        <Text>
            This is the regiter page.
        </Text>

        <View>
            <Text>Email</Text>
            <TextInput
            placeholder='Enter your Email'
            placeholderTextColor="#999"
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType='email-address' 
            />
        </View>
        <View>
            <Text>
                Username
            </Text>
            <TextInput
            placeholder='Input a unique username' 
            placeholderTextColor="#999"
            onChangeText={(text) => handleChange('username', text)}

            />
        </View>
        <View>
            <Text>Password</Text>
            <TextInput
            placeholder='enter your password'
            placeholderTextColor="#999"
            value={form.password}
            onChangeText={(text) => handleChange("password", text)}  
            secureTextEntry
            />
        </View>
        <TouchableOpacity
        onPress={handleSubmit}
        > 
        Login
        </TouchableOpacity>
    </View>
  )
}
