"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import transactionService from "@/services/transactionService";
import { showToast } from "@/components/ToastNotificatons";
import { useLoading } from "@/contexts/LoadingContext";

export default function ImportCSV() {
  const router = useRouter();
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedBank, setSelectedBank] = useState("nubank");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        setError("O arquivo deve ser do tipo CSV.");
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const importFile = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo CSV.");
      return;
    }

    setIsLoading(true);
    setError("");
    startLoading();

    try {
      const result = await transactionService.importCSV(file, selectedBank);
      console.log("Importação bem-sucedida:", result);

      showToast("Arquivo importado com sucesso!", "success");
      setSuccess(true);
    } catch (error: any) {
      console.error("Erro na importação:", error);
      setError(error.message || "Ocorreu um erro ao importar o arquivo.");
      showToast(error.message || "Erro ao importar arquivo", "error");
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  const resetForm = () => {
    setFile(null);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Importar Extrato CSV
      </h1>

      {success ? (
        <div
          style={{
            backgroundColor: "#064e3b",
            color: "white",
            padding: "20px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Importação concluída com sucesso!
          </h2>
          <p style={{ marginBottom: "15px" }}>
            Os dados do seu extrato foram importados e processados.
          </p>
          <div>
            <button
              onClick={resetForm}
              style={{
                backgroundColor: "#065f46",
                color: "white",
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                marginRight: "10px",
                cursor: "pointer",
              }}
            >
              Importar outro arquivo
            </button>
            <button
              onClick={() => router.push("/expenses")}
              style={{
                backgroundColor: "#1f2937",
                color: "white",
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Ver meus gastos
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              backgroundColor: "#1f2937",
              padding: "20px",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            {error && (
              <div
                style={{
                  backgroundColor: "#7f1d1d",
                  color: "white",
                  padding: "10px",
                  borderRadius: "4px",
                  marginBottom: "20px",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Modelo de Extrato
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#374151",
                  color: "white",
                  border: "1px solid #4b5563",
                  borderRadius: "4px",
                }}
                disabled={isLoading}
              >
                <option value="nubank">Nubank</option>
                <option value="itau">Itaú</option>
                <option value="bradesco">Bradesco</option>
                <option value="santander">Santander</option>
                <option value="bb">Banco do Brasil</option>
                <option value="caixa">Caixa Econômica</option>
                <option value="inter">Banco Inter</option>
                <option value="outro">Outro Banco</option>
              </select>
              <p
                style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}
              >
                Selecione o banco correspondente ao arquivo que você vai
                importar.
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Arquivo CSV
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#374151",
                  color: "white",
                  border: "1px solid #4b5563",
                  borderRadius: "4px",
                }}
                disabled={isLoading}
              />
              {file && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#9ca3af",
                    marginTop: "4px",
                  }}
                >
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>

            <div style={{ marginTop: "30px" }}>
              <button
                onClick={importFile}
                disabled={isLoading || !file}
                style={{
                  backgroundColor: "#7c3aed",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  border: "none",
                  fontWeight: "bold",
                  cursor: isLoading || !file ? "not-allowed" : "pointer",
                  opacity: isLoading || !file ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {isLoading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "20px",
                        height: "20px",
                        border: "3px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "50%",
                        borderTopColor: "white",
                        animation: "spin 1s linear infinite",
                        marginRight: "10px",
                      }}
                    ></span>
                    Processando...
                  </>
                ) : (
                  "Importar Arquivo"
                )}
              </button>
            </div>

            <style jsx>{`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>

          <div
            style={{
              backgroundColor: "#1f2937",
              padding: "20px",
              borderRadius: "4px",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              Como exportar seu extrato do Nubank
            </h2>
            <ol style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
              <li>Acesse sua conta no aplicativo ou site do Nubank</li>
              <li>Vá para a seção Faturas ou Histórico</li>
              <li>Procure a opção Exportar extrato ou Baixar CSV</li>
              <li>Selecione o período desejado e faça o download</li>
              <li>Importe o arquivo CSV baixado nesta página</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
