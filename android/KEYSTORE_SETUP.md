# Kgando Android — Configuração do Keystore e Play Store

## 1. Gerar o Keystore

Execute este comando uma única vez e guarde o arquivo em local seguro:

```bash
keytool -genkey -v \
  -keystore kgando.keystore \
  -alias kgando \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass SUA_SENHA_AQUI \
  -keypass SUA_SENHA_AQUI \
  -dname "CN=Kgando, OU=Mobile, O=Kgando, L=Brasil, ST=SP, C=BR"
```

**IMPORTANTE:** Nunca perca este arquivo. Sem ele não é possível publicar atualizações.

---

## 2. Extrair SHA-256 para assetlinks.json

```bash
keytool -list -v \
  -keystore kgando.keystore \
  -alias kgando \
  -storepass SUA_SENHA_AQUI \
  | grep "SHA256:"
```

Copie o valor do SHA256 e substitua `PLACEHOLDER_SHA256_SUBSTITUA_APOS_GERAR_KEYSTORE`
no arquivo `../.well-known/assetlinks.json`.

---

## 3. Configurar variáveis de ambiente para o build

Adicione ao `~/.zshrc` ou `~/.bash_profile`:

```bash
export KEYSTORE_PATH="/caminho/para/kgando.keystore"
export KEYSTORE_PASSWORD="SUA_SENHA_AQUI"
export KEY_ALIAS="kgando"
export KEY_PASSWORD="SUA_SENHA_AQUI"
export PLAY_STORE_JSON_KEY="/caminho/para/play_store_key.json"
```

---

## 4. Chave de API do Google Play

1. Acesse [Google Play Console](https://play.google.com/console)
2. Vá em **Configuração** → **Acesso à API**
3. Crie um projeto no Google Cloud Console
4. Crie uma conta de serviço com permissão **Release Manager**
5. Baixe o JSON da conta de serviço
6. Salve como `fastlane/play_store_key.json`

---

## 5. Build e Deploy via Fastlane

```bash
cd android

# Instalar Fastlane (se não tiver)
gem install fastlane

# Build release
fastlane build

# Deploy para track interno
fastlane deploy

# Quando pronto, promover para alpha
fastlane promote_alpha

# Em produção (10% rollout)
fastlane promote_production
```

---

## 6. Após o primeiro deploy

Depois de o app estar publicado com o SHA-256 correto no `assetlinks.json`,
a barra de URL do Chrome desaparecerá e o app funcionará como nativo.

Verificar Digital Asset Links em produção:
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://kgando.com&relation=delegate_permission/common.handle_all_urls
```
