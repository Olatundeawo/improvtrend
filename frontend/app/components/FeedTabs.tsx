import { Pressable, StyleSheet, Text, View } from 'react-native'

type FeedTabValue = "trending" | "newest" | "following"

 interface FeedTabProps {
    value: string,
    onChange : (value: FeedTabValue) => void
    
 }

 const TABS: {label: string, value: FeedTabValue}[]=[
    { label: "Trending", value: "trending"},
    {label: "Newest", value: "newest"},
    {label: "Folllowing", value: "following"}
 ]

export default function FeedTab({value, onChange}: FeedTabProps) {
    return (
        <View style={styles.container}>
            {TABS.map((tab) => {
                const active = tab.value === value
                return (
                    <Pressable 
                    onPress={() => onChange(tab.value)}
                    style={[styles.tab, active && styles.activeTab]}
                    >

                        <Text style={[styles.label, active && styles.activeLabel]}>
                            {tab.label}
                            </Text>

                    </Pressable>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      paddingHorizontal: 16,
      backgroundColor: "transparent",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "rgba(229, 231, 235, 0.5)",
    },
    tab: {
      paddingVertical: 12,
      marginRight: 20,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: "#111827",
    },
    label: {
      fontSize: 14,
      color: "#6B7280",
      fontWeight: "500",
    },
    activeLabel: {
      color: "#111827",
      fontWeight: "600",
    },
  });