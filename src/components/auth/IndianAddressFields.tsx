import React from 'react';
import { INDIAN_STATES_AND_UTS, validatePincode } from '../../data/indianAddressData';

export interface AddressFieldGroup {
  country: string;
  state: string;
  district: string;
  city: string;
  locality: string;
  street: string;
  pincode: string;
}

interface IndianAddressFieldsProps {
  title: string;
  value: AddressFieldGroup;
  onChange: (updated: AddressFieldGroup) => void;
  disabled?: boolean;
  errors?: Partial<Record<keyof AddressFieldGroup, string>>;
}

export const IndianAddressFields: React.FC<IndianAddressFieldsProps> = ({
  title,
  value,
  onChange,
  disabled = false,
  errors = {},
}) => {
  const selectedStateObj = INDIAN_STATES_AND_UTS.find((s) => s.name === value.state);
  const availableDistricts = selectedStateObj?.districts || [];

  const updateField = <K extends keyof AddressFieldGroup>(key: K, fieldVal: AddressFieldGroup[K]) => {
    const next = { ...value, [key]: fieldVal };
    if (key === 'state') {
      const stateObj = INDIAN_STATES_AND_UTS.find((s) => s.name === fieldVal);
      next.district = stateObj?.districts[0] || '';
    }
    onChange(next);
  };

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <h3 className="text-sm font-bold text-[#102A56]">{title}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Country <span className="text-red-600">*</span>
          </label>
          <select
            value={value.country}
            disabled={disabled}
            onChange={(e) => updateField('country', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
          >
            <option value="India">India</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            State / Union Territory <span className="text-red-600">*</span>
          </label>
          <select
            value={value.state}
            disabled={disabled}
            onChange={(e) => updateField('state', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
          >
            <option value="">Select State or UT</option>
            <optgroup label="States">
              {INDIAN_STATES_AND_UTS.filter((s) => s.type === 'State').map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Union Territories">
              {INDIAN_STATES_AND_UTS.filter((s) => s.type === 'UT').map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          </select>
          {errors.state && <p className="text-[11px] text-red-600 mt-1">{errors.state}</p>}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            District <span className="text-red-600">*</span>
          </label>
          {availableDistricts.length > 0 ? (
            <select
              value={availableDistricts.includes(value.district) ? value.district : '__custom'}
              disabled={disabled}
              onChange={(e) => {
                if (e.target.value !== '__custom') {
                  updateField('district', e.target.value);
                }
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              {!availableDistricts.includes(value.district) && value.district && (
                <option value="__custom">{value.district}</option>
              )}
            </select>
          ) : (
            <input
              type="text"
              disabled={disabled}
              value={value.district}
              onChange={(e) => updateField('district', e.target.value)}
              placeholder="Enter district"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
            />
          )}
          {errors.district && <p className="text-[11px] text-red-600 mt-1">{errors.district}</p>}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            City / Town <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            disabled={disabled}
            value={value.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="e.g. Bengaluru"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
          />
          {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Area / Locality <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            disabled={disabled}
            value={value.locality}
            onChange={(e) => updateField('locality', e.target.value)}
            placeholder="e.g. Malleshwaram / APMC Yard"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
          />
          {errors.locality && <p className="text-[11px] text-red-600 mt-1">{errors.locality}</p>}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            PIN Code <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            disabled={disabled}
            value={value.pincode}
            onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, ''))}
            placeholder="560003"
            className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl font-mono tabular-nums font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0] ${
              value.pincode.length === 6 && !validatePincode(value.pincode)
                ? 'border-red-400'
                : 'border-slate-200'
            }`}
          />
          {errors.pincode && <p className="text-[11px] text-red-600 mt-1">{errors.pincode}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">
            Street Address / Building / Shop No. <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            disabled={disabled}
            value={value.street}
            onChange={(e) => updateField('street', e.target.value)}
            placeholder="e.g. Shop #14, 4th Main Road, Near Market Circle"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
          />
          {errors.street && <p className="text-[11px] text-red-600 mt-1">{errors.street}</p>}
        </div>
      </div>
    </div>
  );
};
