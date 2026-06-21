import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { masterApi, appraisalApi } from '../../services/api';
import AppraisalResult from './AppraisalResult';

const schema = yup.object().shape({
  brand_id: yup.string().required('Brand is required'),
  model_id: yup.string().required('Model is required'),
  variant_id: yup.string().required('Variant is required'),
  color_id: yup.string().required('Color is required'),
  physical_condition_id: yup.string().required('Condition is required'),
  battery_health: yup.number()
    .min(0, 'Minimum 0%')
    .max(100, 'Maximum 100%')
    .nullable(),
  accessories: yup.array(),
  notes: yup.string().max(500, 'Maximum 500 characters'),
  imei: yup.string()
    .matches(/^[0-9]{15}$/, 'IMEI must be 15 digits')
    .nullable(),
});

const AppraisalForm = () => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [appraisalResult, setAppraisalResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      accessories: [],
      battery_health: 80,
    }
  });

  // Fetch master data
  const { data: brands } = useQuery('brands', () => masterApi.getBrands());
  const { data: models } = useQuery(
    ['models', selectedBrand],
    () => masterApi.getModels(selectedBrand),
    { enabled: !!selectedBrand }
  );
  const { data: variants } = useQuery(
    ['variants', selectedModel],
    () => masterApi.getVariants(selectedModel),
    { enabled: !!selectedModel }
  );
  const { data: colors } = useQuery('colors', () => masterApi.getColors());
  const { data: conditions } = useQuery('conditions', () => masterApi.getConditions());
  const { data: accessories } = useQuery('accessories', () => masterApi.getAccessories());

  // Watch fields for dynamic updates
  const watchBrand = watch('brand_id');
  const watchModel = watch('model_id');

  useEffect(() => {
    if (watchBrand !== selectedBrand) {
      setSelectedBrand(watchBrand);
      setValue('model_id', '');
      setValue('variant_id', '');
    }
  }, [watchBrand, selectedBrand, setValue]);

  useEffect(() => {
    if (watchModel !== selectedModel) {
      setSelectedModel(watchModel);
      setValue('variant_id', '');
    }
  }, [watchModel, selectedModel, setValue]);

  const mutation = useMutation(appraisalApi.create, {
    onSuccess: (response) => {
      setAppraisalResult(response.data);
      toast.success('Appraisal created successfully!');
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create appraisal');
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📝 New Unit Appraisal
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                {...register('brand_id')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Brand</option>
                {brands?.data?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brand_id && (
                <p className="mt-1 text-sm text-red-500">{errors.brand_id.message}</p>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model <span className="text-red-500">*</span>
              </label>
              <select
                {...register('model_id')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={!selectedBrand}
              >
                <option value="">Select Model</option>
                {models?.data?.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {errors.model_id && (
                <p className="mt-1 text-sm text-red-500">{errors.model_id.message}</p>
              )}
            </div>

            {/* Variant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RAM / ROM <span className="text-red-500">*</span>
              </label>
              <select
                {...register('variant_id')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={!selectedModel}
              >
                <option value="">Select Variant</option>
                {variants?.data?.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.ram}GB / {variant.rom}GB
                  </option>
                ))}
              </select>
              {errors.variant_id && (
                <p className="mt-1 text-sm text-red-500">{errors.variant_id.message}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color <span className="text-red-500">*</span>
              </label>
              <select
                {...register('color_id')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Color</option>
                {colors?.data?.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
              {errors.color_id && (
                <p className="mt-1 text-sm text-red-500">{errors.color_id.message}</p>
              )}
            </div>

            {/* Physical Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physical Condition <span className="text-red-500">*</span>
              </label>
              <select
                {...register('physical_condition_id')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Condition</option>
                {conditions?.data?.map((condition) => (
                  <option key={condition.id} value={condition.id}>
                    {condition.label} - {condition.score}%
                  </option>
                ))}
              </select>
              {errors.physical_condition_id && (
                <p className="mt-1 text-sm text-red-500">{errors.physical_condition_id.message}</p>
              )}
            </div>

            {/* Battery Health */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Battery Health (%)
              </label>
              <input
                type="number"
                {...register('battery_health')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="85"
              />
              {errors.battery_health && (
                <p className="mt-1 text-sm text-red-500">{errors.battery_health.message}</p>
              )}
            </div>
          </div>

          {/* Accessories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelengkapan (Accessories)
            </label>
            <Controller
              name="accessories"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-4">
                  {accessories?.data?.map((item) => (
                    <label key={item.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={item.id}
                        checked={field.value?.includes(item.id) || false}
                        onChange={(e) => {
                          const value = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...value, item.id]);
                          } else {
                            field.onChange(value.filter(id => id !== item.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan Minus / Kerusakan
            </label>
            <textarea
              {...register('notes')}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe any defects, scratches, or issues..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* IMEI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IMEI (Optional)
            </label>
            <input
              type="text"
              {...register('imei')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="15-digit IMEI number"
              maxLength="15"
            />
            {errors.imei && (
              <p className="mt-1 text-sm text-red-500">{errors.imei.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                'Save Appraisal'
              )}
            </button>
            <button
              type="reset"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Appraisal Result */}
        <AnimatePresence>
          {appraisalResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8"
            >
              <AppraisalResult result={appraisalResult} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AppraisalForm;