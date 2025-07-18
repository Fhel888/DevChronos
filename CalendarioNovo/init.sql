-- Criação do banco de dados para o Calendário ENIAC
CREATE DATABASE IF NOT EXISTS calendario_eniac;
USE calendario_eniac;

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao_breve TEXT,
    descricao_completa TEXT,
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL,
    local_evento VARCHAR(255) NOT NULL,
    tipo_evento ENUM('tecnologia', 'empregabilidade', 'saude', 'integracao') NOT NULL,
    publico_alvo ENUM('todos', 'alunos', 'professores', 'escolas-parceiras') NOT NULL,
    periodo ENUM('manha', 'tarde', 'noite', 'integral') NOT NULL,
    imagem_evento LONGTEXT, -- Base64 da imagem
    destaque BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao) VALUES
('admin_username', 'admin', 'Nome de usuário do administrador'),
('admin_password', 'admin123', 'Senha do administrador (deve ser hash em produção)'),
('titulo_sistema', 'Calendário Institucional ENIAC', 'Título do sistema'),
('versao_sistema', '1.0.0', 'Versão atual do sistema');

-- Banco iniciado sem eventos - admin deve cadastrar os eventos através do sistema
