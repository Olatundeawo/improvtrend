import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Turns } from '../components/type'


export default function UseStory() {
    const [ turns, setTurns] = useState<Turns[]>([])
    const [newTurn, setNewTurn] = useState({
        characterId: "",
        content: ""
    })
    const { id } = useLocalSearchParams()


    const URL = process.env.EXPO_PUBLIC_BASE_URL;
    const fetchTurn = async () => {
        const token = await AsyncStorage.getItem("access");

        if (!token) {
            console.log("Register to view stories")
            return;
        }
        const data = {
            characterId: newTurn.characterId,
            content: newTurn.content
        }
        try {

            const res = await axios.post(`${URL}${id}/turns/`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                }
            })
    
            if (res.status !== 201) {
                console.log("cnat post ur contribution")
                return
            }

            if (res.status === 201) {
                setTurns(prev => [...prev, res.data])
              }
              
        } catch (err) {
            console.log("error")
        }

    }
  return {
    turns,
    setTurns,
    newTurn,
    setNewTurn,
    fetchTurn,
  }
}
