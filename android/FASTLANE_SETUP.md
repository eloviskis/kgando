# 🚀 Deploy Automático Android via Fastlane

## 1️⃣ Configurar Service Account no Google Cloud

### Passo 1: Criar Service Account
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione ou crie um projeto para o Kgando
3. Menu **"IAM & Admin"** → **"Service Accounts"**
4. Clique em **"Create Service Account"**
5. Preencha:
   - **Nome:** `fastlane-kgando`
   - **Descrição:** `Deploy automático do Kgando via Fastlane`
6. Clique em **"Create and Continue"**
7. **Pule** as permissões de projeto (não precisa)
8. Clique em **"Done"**

### Passo 2: Gerar chave JSON
1. Na lista de Service Accounts, clique no email criado (ex: `fastlane-kgando@...`)
2. Aba **"Keys"** → **"Add Key"** → **"Create new key"**
3. Selecione **JSON**
4. Clique em **"Create"**
5. **Salve o arquivo JSON** baixado

### Passo 3: Renomear e mover o JSON
```bash
# Dentro da pasta android/
mv ~/Downloads/nome-do-arquivo-baixado.json fastlane/play_store_key.json
chmod 600 fastlane/play_store_key.json
```

## 2️⃣ Dar Permissões no Google Play Console

1. Acesse [Google Play Console](https://play.google.com/console/)
2. Selecione o app **Kgando**
3. Menu lateral → **"Usuários e permissões"** (ou "Users and permissions")
4. Clique em **"Convidar novos usuários"**
5. Cole o **email da Service Account** (ex: `fastlane-kgando@xyz.iam.gserviceaccount.com`)
6. **Permissões necessárias:**
   - ✅ **Exibir informações do app** (View app information)
   - ✅ **Gerenciar versões de teste** (Manage testing tracks)
   - ✅ **Criar e editar versões de rascunho** (Create and edit draft releases)
   - ✅ **Gerenciar APKs e AABs de teste** (Manage production APKs)
7. Clique em **"Convidar usuário"** → **"Enviar convite"**

**IMPORTANTE:** Aguarde 5-10 minutos para as permissões serem aplicadas.

## 3️⃣ Testar o Deploy

### Opção A: Deploy manual via Fastlane
```bash
cd /Volumes/Dados/CAGUT/android
fastlane deploy
```

Isso vai:
1. ✅ Gerar o AAB de release
2. ✅ Fazer upload automático para "Teste interno" (draft)
3. ✅ Criar rascunho da versão no Play Console

### Opção B: Script automatizado
```bash
cd /Volumes/Dados/CAGUT/android
bash deploy-playstore.sh
```

## 4️⃣ Lanes disponíveis

### `fastlane build`
Apenas gera o AAB (sem upload)

### `fastlane deploy`
Gera AAB + faz upload para **Teste interno** (draft)

### `fastlane promote_alpha`
Promove versão de teste interno → alpha

### `fastlane promote_production`
Promove versão de alpha → produção (10% rollout)

## 5️⃣ Incrementar versão automaticamente

Antes de cada deploy, lembre de incrementar o `versionCode`:

```bash
# Editar android/app/build.gradle
versionCode 2 → versionCode 3
```

Ou use o script `deploy-playstore.sh` que faz isso automaticamente!

## 🔒 Segurança

**NUNCA** faça commit do arquivo `play_store_key.json` no Git!

Já está no `.gitignore`, mas verifique:
```bash
cat .gitignore | grep play_store_key.json
```

## 🐛 Troubleshooting

### Erro: "The caller does not have permission"
- Aguarde 10 minutos após adicionar a Service Account
- Verifique se as permissões estão corretas no Play Console

### Erro: "Version code X has already been used"
- Incremente o `versionCode` no `build.gradle`

### Erro: "APK or AAB file not found"
- Execute `./gradlew clean` antes de `fastlane deploy`
