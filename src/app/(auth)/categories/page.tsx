"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  FiPlus,
  FiTrash2,
  FiTag,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import ToastNotifications, { showToast } from "@/components/ToastNotificatons";

interface Category {
  id: string;
  name: string;
  color: string;
}

const predefinedColors = [
  "#EF4444", // Vermelho
  "#F97316", // Laranja
  "#F59E0B", // Âmbar
  "#EAB308", // Amarelo
  "#84CC16", // Lima
  "#22C55E", // Verde
  "#10B981", // Esmeralda
  "#14B8A6", // Turquesa
  "#06B6D4", // Ciano
  "#0EA5E9", // Azul Claro
  "#3B82F6", // Azul
  "#6366F1", // Índigo
  "#8B5CF6", // Violeta
  "#A855F7", // Roxo
  "#D946EF", // Fúcsia
  "#EC4899", // Rosa
  "#F43F5E", // Rosa Escuro
  "#6B7280", // Cinza
];

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "color">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(predefinedColors[0]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const storedCategories = localStorage.getItem("zentavo_categories");
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      showToast("Erro ao carregar categorias", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (name: string, color: string) => {
    try {
      if (!name.trim()) {
        showToast("O nome da categoria é obrigatório", "error");
        return false;
      }

      if (
        categories.some((cat) => cat.name.toLowerCase() === name.toLowerCase())
      ) {
        showToast("Já existe uma categoria com este nome", "error");
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      const newCategory: Category = {
        id: Date.now().toString(),
        name: name.trim(),
        color,
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);

      localStorage.setItem(
        "zentavo_categories",
        JSON.stringify(updatedCategories)
      );

      showToast("Categoria criada com sucesso", "success");
      return true;
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      showToast("Erro ao criar categoria", "error");
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const updatedCategories = categories.filter((cat) => cat.id !== id);
      setCategories(updatedCategories);

      localStorage.setItem(
        "zentavo_categories",
        JSON.stringify(updatedCategories)
      );

      showToast("Categoria excluída com sucesso", "success");
      return true;
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      showToast("Erro ao excluir categoria", "error");
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === "asc"
        ? a.color.localeCompare(b.color)
        : b.color.localeCompare(a.color);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createCategory(newCategoryName, selectedColor);
    if (success) {
      setNewCategoryName("");
      setSelectedColor(predefinedColors[0]);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      await deleteCategory(id);
    }
  };

  const handleSort = (field: "name" | "color") => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ToastNotifications />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center mr-3 shadow-md">
              <FiTag className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold">Gerenciar Categorias</h2>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </motion.div>

        {/* Form para adicionar categoria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-5 mb-6 shadow-lg"
        >
          <h3 className="text-lg p-3 font-bold mb-4 flex items-center">
            <FiPlus className="mr-2 text-purple-400" /> Nova Categoria
          </h3>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end p-3"
          >
            <div className="sm:col-span-3">
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Nome
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2.5 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Educação"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Cor
              </label>
              <div className="flex items-center gap-3">
                {/* Input color nativo do HTML5 */}
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-0"
                  style={{
                    background: "transparent",
                  }}
                />
                <div className="flex-1 bg-gray-700 rounded-lg border border-gray-600 px-4 py-2">
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full mr-3"
                      style={{ backgroundColor: selectedColor }}
                    ></div>
                    <span className="font-mono text-sm">
                      {selectedColor.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm:col-span-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2.5 font-medium flex items-center justify-center shadow-md"
              >
                <FiPlus className="mr-2" />
                <span>Adicionar</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Tabela de categorias */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg overflow-hidden shadow-xl"
        >
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th
                      className="px-6 py-4 font-medium cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Nome
                        {sortField === "name" &&
                          (sortDirection === "asc" ? (
                            <FiArrowUp className="ml-2 text-purple-400" />
                          ) : (
                            <FiArrowDown className="ml-2 text-purple-400" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 font-medium cursor-pointer"
                      onClick={() => handleSort("color")}
                    >
                      <div className="flex items-center">
                        Cor
                        {sortField === "color" &&
                          (sortDirection === "asc" ? (
                            <FiArrowUp className="ml-2 text-purple-400" />
                          ) : (
                            <FiArrowDown className="ml-2 text-purple-400" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-4 font-medium text-right w-24">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {sortedCategories.length > 0 ? (
                    sortedCategories.map((category) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={category.id}
                        className="hover:bg-gray-700 group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div
                              className="w-5 h-5 rounded-full mr-3 flex-shrink-0"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex space-x-2 items-center">
                              <div
                                className="w-8 h-8 rounded-md"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="text-gray-400">
                                {category.color}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            onClick={() => handleDelete(category.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/30 rounded-lg"
                            title="Excluir"
                          >
                            <FiTrash2 size={18} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : searchQuery ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        Nenhum resultado encontrado para &quot;{searchQuery}
                        &quot;.
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        Nenhuma categoria cadastrada. Adicione sua primeira
                        categoria usando o formulário acima.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {sortedCategories.length > 0 && (
            <div className="px-6 py-4 bg-gray-700 border-t border-gray-600 flex justify-between items-center text-sm">
              <span className="text-gray-400">
                Mostrando {sortedCategories.length} de {categories.length}{" "}
                categorias
              </span>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
