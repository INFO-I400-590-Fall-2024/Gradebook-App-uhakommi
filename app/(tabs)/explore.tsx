import { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { GradebookContext } from '../../components/GradebookContext';
import { ThemedText } from '@/components/ThemedText';

export default function GradebookScreen() {
  const { thresholds } = useContext(GradebookContext);

  return (
    <View style={styles.gradebookContainer}>
      <ThemedText style={styles.themedText}>
        Current A+ Threshold: {thresholds.APlus}
      </ThemedText>
      <ThemedText style={styles.themedText}>
        Current B+ Threshold: {thresholds.BPlus}
      </ThemedText>
      <ThemedText style={styles.themedText}>
        Current C+ Threshold: {thresholds.CPlus}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  gradebookContainer: {
    padding: 20,
    marginTop:'50%',
    marginHorizontal: 'auto',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    maxWidth: 600,
    alignItems: 'center',
  },
  themedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
