import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  onChange: (dateISO: string) => void;
  initialValue?: string | null;
};

export default function DatePickerField({ onChange, initialValue }: Props) {
  const [date, setDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (initialValue) {
      const d = new Date(initialValue);
      setDate(d);
      setTempDate(d);
    }
  }, [initialValue]);

  const handleChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleSave = () => {
    setDate(tempDate);
    onChange(tempDate.toISOString());
    setShow(false);
  };

  const formatDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.label}>Selected date: {formatDate(date)}</Text>
          <Button title="Select date" onPress={() => setShow(true)} />
        </View>
      </TouchableWithoutFeedback>

      {show && (
        <Modal transparent animationType="slide" visible={show}>
          <TouchableWithoutFeedback onPress={() => setShow(false)}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>

          <View style={styles.bottomPicker}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleChange}
              style={{ backgroundColor: "#fff", alignSelf: "center" }}
            />
            <Button title="Save" onPress={handleSave} />
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#00000050",
  },
  bottomPicker: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
