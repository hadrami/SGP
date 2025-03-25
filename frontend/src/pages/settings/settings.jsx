// src/pages/settings/Settings.js
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../../redux/slices/authSlice";
import authApi from "../../api/auth.api";

function Settings() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, language } = useSelector((state) => state.auth);

  // État pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Changer la langue de l'application
  const handleLanguageChange = (lang) => {
    dispatch(setLanguage(lang));
  };

  // Soumettre le formulaire de changement de mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    // Vérifier la longueur minimale
    if (newPassword.length < 6) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 6 caractères"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setPasswordError(null);

      await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      // Réinitialiser le formulaire
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess("Votre mot de passe a été mis à jour avec succès");

      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setPasswordSuccess(null);
      }, 3000);
    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
          "Une erreur est survenue lors du changement de mot de passe"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {t("navigation.settings")}
      </h1>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Paramètres de langue
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Choisissez la langue d'affichage de l'application.</p>
          </div>
          <div className="mt-5">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleLanguageChange("fr")}
                className={`px-4 py-2 rounded-md ${
                  language === "fr"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("ar")}
                className={`px-4 py-2 rounded-md ${
                  language === "ar"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Changer votre mot de passe
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Assurez-vous d'utiliser un mot de passe fort et unique.</p>
          </div>

          <form
            className="mt-5 sm:flex flex-col sm:items-start"
            onSubmit={handlePasswordChange}
          >
            {passwordError && (
              <div className="mb-4 rounded-md bg-red-50 p-4 w-full max-w-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {passwordError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 rounded-md bg-green-50 p-4 w-full max-w-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      {passwordSuccess}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full max-w-md">
              <div className="mb-4">
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  id="current-password"
                  name="current-password"
                  className="form-input mt-1"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="new-password"
                  name="new-password"
                  className="form-input mt-1"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  className="form-input mt-1"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
