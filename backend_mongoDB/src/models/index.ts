import mongoose, { Schema } from "mongoose";
import { Role, TipoMovimentacao } from "../types/domain";

function idJsonPlugin(schema: Schema) {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      if (ret._id != null) {
        ret.id = String(ret._id);
        delete ret._id;
      }
      return ret;
    },
  });
}

const testeSchema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    senha: { type: String, required: true },
  },
  { timestamps: false },
);
idJsonPlugin(testeSchema);

const usuarioSchema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    ativo: { type: Boolean, default: true },
    data_atual: { type: Date, default: Date.now },
  },
  { timestamps: false },
);
idJsonPlugin(usuarioSchema);

const moduloSchema = new Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, default: null },
  },
  { timestamps: false },
);
idJsonPlugin(moduloSchema);

const perfilSchema = new Schema(
  {
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },
    descricao: { type: String, default: null },
  },
  { timestamps: false },
);
idJsonPlugin(perfilSchema);

const materiaPrimaSchema = new Schema(
  {
    nome: { type: String, required: true },
    categoria: { type: String, required: true },
    unidade: { type: String, required: true },
    estoque_minimo: { type: Number, required: true },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: false },
);
idJsonPlugin(materiaPrimaSchema);

const fornecedorSchema = new Schema(
  {
    nome: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true },
    email: { type: String, default: null },
    telefone: { type: String, default: null },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: false },
);
idJsonPlugin(fornecedorSchema);

const usuarioPerfilSchema = new Schema(
  {
    usuario_id: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    perfil_id: {
      type: Schema.Types.ObjectId,
      ref: "Perfil",
      required: true,
    },
  },
  { timestamps: false },
);
usuarioPerfilSchema.index({ usuario_id: 1, perfil_id: 1 }, { unique: true });
idJsonPlugin(usuarioPerfilSchema);

const materiaFornecedorSchema = new Schema(
  {
    materia_prima_id: {
      type: Schema.Types.ObjectId,
      ref: "MateriaPrima",
      required: true,
    },
    fornecedor_id: {
      type: Schema.Types.ObjectId,
      ref: "Fornecedor",
      required: true,
    },
  },
  { timestamps: false },
);
materiaFornecedorSchema.index(
  { materia_prima_id: 1, fornecedor_id: 1 },
  { unique: true },
);
idJsonPlugin(materiaFornecedorSchema);

const permissaoModuloSchema = new Schema(
  {
    perfil_id: {
      type: Schema.Types.ObjectId,
      ref: "Perfil",
      required: true,
    },
    modulo_id: {
      type: Schema.Types.ObjectId,
      ref: "Modulo",
      required: true,
    },
    pode_ler: { type: Boolean, default: false },
    pode_criar: { type: Boolean, default: false },
    pode_atualizar: { type: Boolean, default: false },
    pode_excluir: { type: Boolean, default: false },
  },
  { timestamps: false },
);
idJsonPlugin(permissaoModuloSchema);

const estoqueAtualSchema = new Schema(
  {
    materia_prima_id: {
      type: Schema.Types.ObjectId,
      ref: "MateriaPrima",
      required: true,
      unique: true,
    },
    quantidade: { type: Number, default: 0 },
  },
  { timestamps: false },
);
idJsonPlugin(estoqueAtualSchema);

const movimentacaoSchema = new Schema(
  {
    materia_prima_id: {
      type: Schema.Types.ObjectId,
      ref: "MateriaPrima",
      required: true,
    },
    tipo: {
      type: String,
      enum: Object.values(TipoMovimentacao),
      required: true,
    },
    quantidade: { type: Number, required: true },
    motivo: { type: String, default: null },
    usuario_id: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    data_atual: { type: Date, default: Date.now },
  },
  { timestamps: false },
);
idJsonPlugin(movimentacaoSchema);

export const Teste = mongoose.model("Teste", testeSchema);
export const Usuario = mongoose.model("Usuario", usuarioSchema);
export const Modulo = mongoose.model("Modulo", moduloSchema);
export const Perfil = mongoose.model("Perfil", perfilSchema);
export const MateriaPrima = mongoose.model("MateriaPrima", materiaPrimaSchema);
export const Fornecedor = mongoose.model("Fornecedor", fornecedorSchema);
export const UsuarioPerfil = mongoose.model("UsuarioPerfil", usuarioPerfilSchema);
export const MateriaFornecedor = mongoose.model(
  "MateriaFornecedor",
  materiaFornecedorSchema,
);
export const PermissaoModulo = mongoose.model(
  "PermissaoModulo",
  permissaoModuloSchema,
);
export const EstoqueAtual = mongoose.model("EstoqueAtual", estoqueAtualSchema);
export const Movimentacao = mongoose.model("Movimentacao", movimentacaoSchema);
