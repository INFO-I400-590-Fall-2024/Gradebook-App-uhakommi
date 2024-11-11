import { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { GradebookContext } from '../../components/GradebookContext';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';

export default function FirebaseFetcher() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const { thresholds, setThresholds } = useContext(GradebookContext);
  const [newGrades, setNewGrades] = useState({});
  const [classAverage, setClassAverage] = useState(0);

  useEffect(() => {
    const requestPermissionsAndScheduleReminder = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Notification permissions are required to receive alerts.');
      } else {
        scheduleGradeReviewReminder('11/11/2024');
      }
    };

    requestPermissionsAndScheduleReminder();
    
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentData = [];
      querySnapshot.forEach((doc) => {
        studentData.push({ id: doc.id, ...doc.data() });
      });
      setStudents(studentData);
      calculateClassAverage(studentData);
    };

    fetchData();
  }, []);

  const handleThresholdChange = (value, grade) => {
    const parsedValue = Number(value);
    if (!isNaN(parsedValue)) {
      setThresholds(prev => ({
        ...prev,
        [grade]: parsedValue
      }));
    } else {
      Alert.alert('Please enter a valid number.');
    }
  };

  const addStudent = async () => {
    if (name && grade) {
      try {
        const docRef = await addDoc(collection(db, 'students'), { name, grade });
        const updatedStudents = [...students, { id: docRef.id, name, grade }];
        setStudents(updatedStudents);

        setName('');
        setGrade('');
        Alert.alert('Student added successfully!');

        calculateClassAverage(updatedStudents);
      } catch (error) {
        console.error("Error adding document: ", error);
        Alert.alert('Error adding student.');
      }
    } else {
      Alert.alert('Please fill in both fields.');
    }
  };

  const updateGrade = async (studentId, newGrade) => {
    const parsedGrade = Number(newGrade);
    if (!isNaN(parsedGrade)) {
      try {
        const studentDoc = doc(db, 'students', studentId);
        await updateDoc(studentDoc, { grade: parsedGrade });

        const updatedStudents = students.map(student =>
          student.id === studentId ? { ...student, grade: parsedGrade } : student
        );
        setStudents(updatedStudents);

        const oldAverage = classAverage;
        const newAverage = calculateClassAverage(updatedStudents);
        checkClassAverageChange(oldAverage, newAverage);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: parsedGrade >= thresholds.APlus ? 'Outstanding!' : 
                   parsedGrade >= thresholds.BPlus ? 'Good, Keep it up!' :
                   parsedGrade >= thresholds.CPlus ? 'Well tried!' : 'Grade Updated',
            body: parsedGrade >= thresholds.APlus ? 'Grade A+ Threshold Crossed! 🎉.' :
                   parsedGrade >= thresholds.BPlus ? 'Grade B+ Threshold Crossed! 🎉' :
                   parsedGrade >= thresholds.CPlus ? 'Grade C+ Threshold Crossed! 🎉' :
                   `A grade has been updated to ${parsedGrade}% for a student.`,
            tag: 'grades',
            sound: 'custom_sound.wav',
          },
          trigger: null,
        });

        setNewGrades(prevGrades => ({ ...prevGrades, [studentId]: '' })); 
      } catch (error) {
        console.error('Error updating grade:', error);
        Alert.alert('Failed to update grade.');
      }
    } else {
      Alert.alert('Please enter a valid number for the new grade.');
    }
  };

  const calculateClassAverage = (studentData) => {
    const total = studentData.reduce((sum, student) => sum + Number(student.grade), 0);
    const average = total / studentData.length;
    setClassAverage(average);
    return average;
  };

  const checkClassAverageChange = async (oldAverage, newAverage) => {
    if (Math.abs(newAverage - oldAverage) >= 5) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Significant Change in Class Average',
          body: `Class average has changed by ${Math.abs(newAverage - oldAverage).toFixed(1)}%`,
          tag: 'announcements',
          sound: 'custom_sound.wav',
        },
        trigger: null,
      });
    }
  };

  const scheduleGradeReviewReminder = async (dueDate) => {
    try {
      const [month, day, year] = dueDate.split('/').map(Number);
      const reminderDate = new Date(year, month - 1, day);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(9, 0, 0, 0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Grade Review Reminder',
          body: 'Grade review deadline is tomorrow!',
          tag: 'deadlines',
          sound: require('../../assets/mixkit-happy-bells-notification-937.wav'),
        },
        trigger: reminderDate > new Date() ? reminderDate : null,
      });
    } catch (error) {
      console.error("Error scheduling grade review reminder:", error);
    }
  };


  return (
    <ScrollView>
      <View style={styles.container}>
        <TextInput
          placeholder="Set A+ Threshold"
          value={String(thresholds.APlus)}
          onChangeText={(text) => handleThresholdChange(text, 'APlus')}
          style={styles.input}
        />
        <TextInput
          placeholder="Set B+ Threshold"
          value={String(thresholds.BPlus)}
          onChangeText={(text) => handleThresholdChange(text, 'BPlus')}
          style={styles.input}
        />
        <TextInput
          placeholder="Set C+ Threshold"
          value={String(thresholds.CPlus)}
          onChangeText={(text) => handleThresholdChange(text, 'CPlus')}
          style={styles.input}
        />

        <TextInput
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Enter grade"
          value={grade}
          onChangeText={setGrade}
          style={styles.input}
          keyboardType="numeric"
        />
        <Button title="Add Student" onPress={addStudent} />

        <View style={styles.studentMap}>
          {students.map(student => (
            <View style={styles.studentlist} key={student.id}>
              <Text>{student.name} - Grade: {student.grade}</Text>
              <TextInput
                placeholder="New Grade"
                keyboardType="numeric"
                value={newGrades[student.id] || ''}
                onChangeText={(newGrade) => setNewGrades({ ...newGrades, [student.id]: newGrade })}
                style={styles.input}
              />
              <Button
                title="Update Grade"
                onPress={() => updateGrade(student.id, newGrades[student.id])}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: '20%',
    width: '70%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  studentlist: {
    borderWidth: 1,
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  studentMap: {
    width: '60%',
    marginVertical: 20,
    alignSelf: 'center',
  },
});
