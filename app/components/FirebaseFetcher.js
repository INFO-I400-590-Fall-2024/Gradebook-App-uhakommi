import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { useContext } from 'react';
import { GradebookContext } from '../../components/GradebookContext';

export default function FirebaseFetcher() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const { thresholds, setThresholds } = useContext(GradebookContext);
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentData = [];
      querySnapshot.forEach((doc) => {
        studentData.push({ id: doc.id, ...doc.data() });
      });
      setStudents(studentData);
      console.log(studentData);
    };

    fetchData();
  }, []);

  const handelThresholdChange = (value, grade) => {
    setThresholds(prev => ({
      ...prev,
      [grade]: Number(value)
    }))
  }

  const addStudent = async () => {
    if (name && grade) { // Ensure both fields are filled
      try {
        const docRef = await addDoc(collection(db, 'students'), {
          name: name,
          grade: grade,
        });

        // Update local state with the new student entry
        setStudents((prevStudents) => [
          ...prevStudents,
          { id: docRef.id, name: name, grade: grade },
        ]);

        setName('');
        setGrade('');
        alert('Student added successfully!');
      } catch (error) {
        console.error("Error adding document: ", error);
        alert('Error adding student.');
      }
    } else {
      alert('Please fill in both fields.');
    }
  };

  return (
    <ScrollView>
     
      <View style={styles.container}>
        
      <TextInput
  placeholder="Set A+ Threshold"
  value={String(thresholds.APlus)} // Ensure this state is valid
  onChangeText={(text) => handelThresholdChange(text, 'APlus')} // Fix typo in grade key
  style={{ borderBottomWidth: 1, marginBottom: 10, padding: 8 }}
/>
<TextInput
  placeholder="Set B+ Threshold"
  value={String(thresholds.BPlus)}
  onChangeText={(text) => handelThresholdChange(text, 'BPlus')} // Fix typo in grade key
  style={{ borderBottomWidth: 1, marginBottom: 10, padding: 8 }}
/>
<TextInput
  placeholder="Set C+ Threshold"
  value={String(thresholds.CPlus)}
  onChangeText={(text) => handelThresholdChange(text, 'CPlus')} // Fix typo in grade key
  style={{ borderBottomWidth: 1, marginBottom: 10, padding: 8 }}
/>

    
        {/* Input fields for name and grade */}
        <TextInput
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
          style={{ borderBottomWidth: 1, marginBottom: 10, padding: 8 }}
        />
        <TextInput
          placeholder="Enter grade"
          value={grade}
          onChangeText={setGrade}
          style={{ borderBottomWidth: 1, marginBottom: 10, padding: 8 }}
          keyboardType="numeric"
        />
        <Button title="Add Student" onPress={addStudent} />

        {/* Displaying list of students */}
        <View style={styles.studentMap}>
          {students.map((student) => (
            <View style={styles.studentlist} key={student.id}>
              <Text>{student.name} - Grade: {student.grade}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop:'20%',
    width: '70%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 20,
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
