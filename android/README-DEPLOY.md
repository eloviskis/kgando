# 🚀 Deploy Automático - Guia Rápido

## Setup inicial (só precisa fazer 1 vez)

1. **Criar Service Account no Google Cloud:**
   - https://console.cloud.google.com/
   - IAM & Admin → Service Accounts → Create
   - Nome: `fastlane-kgando`
   - Criar chave JSON → Salvar

2. **Mover JSON para o projeto:**
   ```bash
   mv ~/Downloads/sua-chave.json /Volumes/Dados/CAGUT/android/fastlane/play_store_key.json
   chmod 600 /Volumes/Dados/CAGUT/android/fastlane/play_store_key.json
   ```

3. **Dar permissões no Play Console:**
   - https://play.google.com/console/
   - Usuários e permissões → Convidar
   - Cole email da Service Account
   - Permissões: Gerenciar versões de teste + Criar versões

4. **Aguarde 10 minutos** para permissões serem aplicadas

## Fazer deploy (toda vez que quiser atualizar)

```bash
cd /Volumes/Dados/CAGUT/android
bash deploy-playstore.sh
```

Isso vai:
- ✅ Incrementar versionCode automaticamente
- ✅ Gerar novo AAB
- ✅ Fazer upload para Teste interno (draft)
- ✅ Commit e push da nova versão

**Depois:**
1. Acesse Play Console
2. Revise a versão em Teste interno
3. Publique ou promova para produção

## Comandos úteis

```bash
# Apenas gerar AAB (sem upload)
fastlane build

# Deploy manual
fastlane deploy

# Promover teste interno → alpha
fastlane promote_alpha

# Promover alpha → produção
fastlane promote_production
```

## Verificar status

```bash
# Ver versionCode atual
grep versionCode app/build.gradle
```

Para mais detalhes, veja [FASTLANE_SETUP.md](./FASTLANE_SETUP.md)
