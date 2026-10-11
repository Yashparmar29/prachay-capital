import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { SignatureUploader } from '../../components/common/SignatureUploader';
import { PenTool, CheckCircle, Save } from 'lucide-react';

export const EmployeeSignaturePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { success, error } = useToast();
  const [signatureFile, setSignatureFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSaveSignature = async () => {
    if (!signatureFile) {
      error('Please upload or draw a signature first');
      return;
    }

    setSaving(true);
    try {
      const res = await authService.uploadProfileSignature(signatureFile);
      updateUserProfile({ signaturePath: res.signaturePath });
      success('Profile signature updated successfully! It will now auto-attach to future vouchers.');
    } catch (err) {
      error(err.message || 'Failed to update profile signature');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          My Digital Signature
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Save your standard electronic signature so that expense vouchers can reuse it automatically
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <SignatureUploader
          label="Profile Signature Image"
          currentSignatureUrl={user?.signaturePath}
          onSignatureSelected={setSignatureFile}
        />

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {user?.signaturePath ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Signature active on your profile
              </span>
            ) : (
              'No default signature registered yet'
            )}
          </p>

          <button
            onClick={handleSaveSignature}
            disabled={saving || !signatureFile}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save to Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
