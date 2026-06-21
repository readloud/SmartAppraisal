import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAppraisal } from '../hooks/useAppraisal';

const AppraisalScreen = () => {
  const [form, setForm] = useState({
    brand_id: '',
    model_id: '',
    variant_id: '',
    color_id: '',
    physical_condition_id: '',
    battery_health: '80',
    accessories: [],
    notes: '',
    imei: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { createAppraisal } = useAppraisal();

  // Mock data for demo
  const brands = [
    { id: '1', name: 'Apple' },
    { id: '2', name: 'Samsung' },
    { id: '3', name: 'Xiaomi' },
  ];

  const models = [
    { id: '1', name: 'iPhone 14 Pro' },
    { id: '2', name: 'iPhone 14' },
    { id: '3', name: 'iPhone 13' },
  ];

  const variants = [
    { id: '1', name: '6GB/128GB' },
    { id: '2', name: '6GB/256GB' },
    { id: '3', name: '8GB/256GB' },
  ];

  const colors = [
    { id: '1', name: 'Black' },
    { id: '2', name: 'Gold' },
    { id: '3', name: 'Silver' },
  ];

  const conditions = [
    { id: '1', label: 'Mint', score: 100 },
    { id: '2', label: 'Excellent', score: 90 },
    { id: '3', label: 'Good', score: 75 },
  ];

  const accessoriesList = [
    { id: '1', name: 'Box' },
    { id: '2', name: 'Charger' },
    { id: '3', name: 'Cable' },
    { id: '4', name: 'Earphone' },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await createAppraisal(form);
      setResult(response);
      Alert.alert('Success', 'Appraisal created successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccessory = (id) => {
    const current = form.accessories;
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setForm({ ...form, accessories: current });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 New Appraisal</Text>
      </View>

      <View style={styles.form}>
        {/* Brand */}
        <View style={styles.field}>
          <Text style={styles.label}>Brand *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.brand_id}
              onValueChange={(value) => setForm({ ...form, brand_id: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Brand" value="" />
              {brands.map(b => (
                <Picker.Item key={b.id} label={b.name} value={b.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Model */}
        <View style={styles.field}>
          <Text style={styles.label}>Model *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.model_id}
              onValueChange={(value) => setForm({ ...form, model_id: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Model" value="" />
              {models.map(m => (
                <Picker.Item key={m.id} label={m.name} value={m.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Variant */}
        <View style={styles.field}>
          <Text style={styles.label}>RAM / ROM *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.variant_id}
              onValueChange={(value) => setForm({ ...form, variant_id: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Variant" value="" />
              {variants.map(v => (
                <Picker.Item key={v.id} label={v.name} value={v.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Color */}
        <View style={styles.field}>
          <Text style={styles.label}>Color *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.color_id}
              onValueChange={(value) => setForm({ ...form, color_id: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Color" value="" />
              {colors.map(c => (
                <Picker.Item key={c.id} label={c.name} value={c.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Condition */}
        <View style={styles.field}>
          <Text style={styles.label}>Physical Condition *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.physical_condition_id}
              onValueChange={(value) => setForm({ ...form, physical_condition_id: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Condition" value="" />
              {conditions.map(c => (
                <Picker.Item 
                  key={c.id} 
                  label={`${c.label} (${c.score}%)`} 
                  value={c.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Battery Health */}
        <View style={styles.field}>
          <Text style={styles.label}>Battery Health (%)</Text>
          <TextInput
            style={styles.input}
            value={form.battery_health}
            onChangeText={(text) => setForm({ ...form, battery_health: text })}
            keyboardType="numeric"
            placeholder="85"
          />
        </View>

        {/* Accessories */}
        <View style={styles.field}>
          <Text style={styles.label}>Accessories</Text>
          <View style={styles.accessoriesContainer}>
            {accessoriesList.map(acc => (
              <TouchableOpacity
                key={acc.id}
                style={[
                  styles.accessoryChip,
                  form.accessories.includes(acc.id) && styles.accessoryChipSelected
                ]}
                onPress={() => toggleAccessory(acc.id)}
              >
                <Text style={[
                  styles.accessoryText,
                  form.accessories.includes(acc.id) && styles.accessoryTextSelected
                ]}>
                  {acc.name}
                </Text>
                {form.accessories.includes(acc.id) && (
                  <Ionicons name="checkmark-circle" size={16} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.notes}
            onChangeText={(text) => setForm({ ...form, notes: text })}
            placeholder="Describe any issues..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* IMEI */}
        <View style={styles.field}>
          <Text style={styles.label}>IMEI (Optional)</Text>
          <TextInput
            style={styles.input}
            value={form.imei}
            onChangeText={(text) => setForm({ ...form, imei: text })}
            placeholder="15-digit IMEI"
            maxLength={15}
          />
        </View>

        {/* Result Display */}
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Recommended Price</Text>
            <Text style={styles.resultPrice}>
              Rp {result.suggested_price.toLocaleString()}
            </Text>
            <Text style={styles.resultRange}>
              Range: Rp {result.price_range_min.toLocaleString()} - Rp {result.price_range_max.toLocaleString()}
            </Text>
            <View style={styles.resultConfidence}>
              <Text style={styles.confidenceText}>
                Confidence: {result.confidence_score}%
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Save Appraisal</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  accessoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accessoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  accessoryChipSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  accessoryText: {
    fontSize: 14,
    color: '#4a5568',
    marginRight: 4,
  },
  accessoryTextSelected: {
    color: '#6366f1',
  },
  resultContainer: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  resultTitle: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  resultRange: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  resultConfidence: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#d1fae5',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppraisalScreen;