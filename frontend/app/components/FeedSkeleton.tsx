import { StyleSheet, View } from "react-native"

type FeedSkeletonProps = {
  count?: number
}

export default function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatar} />
              <View>
                <View style={styles.usernameSkeleton} />
                <View style={styles.timeSkeleton} />
              </View>
            </View>
            <View style={styles.buttonSkeleton} />
          </View>

          <View style={styles.divider} />

          <View style={styles.titleSkeleton} />
          <View style={[styles.titleSkeleton, { width: "60%" }]} />

          <View style={styles.contentSkeleton} />
          <View style={styles.contentSkeleton} />
          <View style={[styles.contentSkeleton, { width: "80%" }]} />

          <View style={styles.divider} />

          <View style={styles.footer}>
            <View style={styles.statsSkeleton} />
            <View style={styles.ctaSkeleton} />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },

  usernameSkeleton: {
    width: 100,
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 6,
  },

  timeSkeleton: {
    width: 60,
    height: 11,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
  },

  buttonSkeleton: {
    width: 60,
    height: 28,
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14,
  },

  titleSkeleton: {
    height: 19,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },

  contentSkeleton: {
    height: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    marginBottom: 6,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statsSkeleton: {
    width: 120,
    height: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
  },

  ctaSkeleton: {
    width: 100,
    height: 34,
    backgroundColor: "#F97316",
    opacity: 0.3,
    borderRadius: 10,
  },
})
