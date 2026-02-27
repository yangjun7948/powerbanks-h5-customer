<template>
  <div class="terms-container">
    <!-- 顶部导航 -->
    <div class="terms-header">
      <van-icon name="arrow-left" size="20" color="#333" @click="router.back()" />
      <span class="terms-header-title">{{ t("routes.terms") }}</span>
      <span style="width: 20px" />
    </div>

    <!-- 内容 -->
    <div class="terms-body">
      <h1 class="terms-main-title">CONDITIONS GÉNÉRALES D'UTILISATION (CGU)</h1>
      <h2 class="terms-brand">ALLO CHARGE</h2>

      <p class="terms-intro">
        Bienvenue sur <strong>Allo Charge</strong>, un service de location de Power Banks partagés, opéré par la société
        <strong>INSTAPRINT</strong> (ci-après « Nous » ou « L'Entreprise »). En vous inscrivant et en utilisant nos
        services, vous (ci-après « L'Utilisateur ») acceptez sans réserve les présentes Conditions Générales
        d'Utilisation.
      </p>

      <div class="terms-section">
        <div class="terms-section-title">ARTICLE 1 : DESCRIPTION DU SERVICE</div>
        <p class="terms-section-body">
          Allo Charge met à la disposition de ses Utilisateurs un réseau de cabinets de recharge situés chez nos
          commerçants partenaires (ci-après « Les Stations »), permettant de louer des Power Banks pour recharger leurs
          appareils mobiles, puis de les restituer dans n'importe quel cabinet Allo Charge disponible.
        </p>
      </div>

      <div class="terms-section">
        <div class="terms-section-title">ARTICLE 2 : INSCRIPTION ET COMPTE</div>
        <div class="terms-clause">
          <span class="terms-clause-num">2.1.</span>
          Pour utiliser le service, l'Utilisateur doit créer un compte via notre plateforme en scannant le QR code sur
          le cabinet.
        </div>
        <div class="terms-clause">
          <span class="terms-clause-num">2.2.</span>
          L'Utilisateur garantit que les informations fournies (notamment le numéro de téléphone) sont exactes.
          L'utilisation du compte est strictement personnelle.
        </div>
      </div>

      <div class="terms-section">
        <div class="terms-section-title">ARTICLE 3 : TARIFICATION, CAUTION ET PAIEMENT</div>
        <div class="terms-clause">
          <span class="terms-clause-num">3.1.</span>
          <strong>Caution :</strong> Avant la première location d'un Power Bank, le versement d'une caution (ex. 5 000
          FCFA) est requis via les moyens de paiement mobiles acceptés (Wave, Orange Money, Moov Money, MTN MoMo, etc.).
        </div>
        <div class="terms-clause">
          <span class="terms-clause-num">3.2.</span>
          <strong>Tarifs de location :</strong> Les tarifs (coût par tranche horaire, facturation minimum, et plafond
          maximum) sont dynamiques. Ils sont affichés clairement sur la page de location de l'application/plateforme
          avant la confirmation de la commande. En acceptant la location, l'Utilisateur accepte le tarif en vigueur
          indiqué à ce moment-là.
        </div>
        <div class="terms-clause">
          <span class="terms-clause-num">3.3.</span>
          <strong>Génération de la commande :</strong> À la restitution du Power Bank dans le cabinet, le système génère
          automatiquement une commande en attente de paiement correspondant au coût total de la session de location.
        </div>
        <div class="terms-clause">
          <span class="terms-clause-num">3.4.</span>
          <strong>Restriction en cas d'impayé :</strong> L'Utilisateur est tenu de régler cette commande en attente. Si
          l'Utilisateur possède une ou plusieurs commande(s) non payée(s), il lui sera strictement impossible d'effectuer
          une nouvelle location de Power Bank ou de demander le remboursement de sa caution. Le paiement intégral des
          sommes dues est une condition préalable et obligatoire pour toute nouvelle location ou demande de restitution
          de la caution.
        </div>
      </div>

      <div class="terms-section">
        <div class="terms-section-title">ARTICLE 4 : EMPRUNT, UTILISATION ET RESTITUTION</div>
        <div class="terms-clause">
          <span class="terms-clause-num">4.1.</span>
          L'Utilisateur s'engage à utiliser le Power Bank avec soin et uniquement pour la recharge d'appareils
          compatibles.
        </div>
        <div class="terms-clause">
          <span class="terms-clause-num">4.2.</span>
          La facturation commence dès le déverrouillage du Power Bank et s'arrête uniquement lorsque le Power Bank est
          correctement inséré et verrouillé dans un cabinet Allo Charge.
        </div>
        <div class="terms-clause">
          <span class="terms-clause-num">4.3.</span>
          Il incombe à l'Utilisateur de s'assurer que le Power Bank est bien enclenché (le voyant lumineux de retour
          confirme la bonne restitution).
        </div>
      </div>

      <div class="terms-section">
        <div class="terms-section-title">ARTICLE 5 : PERTE, VOL OU DOMMAGE</div>
        <div class="terms-clause">
          <span class="terms-clause-num">5.1.</span>
          Si le Power Bank n'est pas restitué dans le délai maximum indiqué sur la plateforme, ou s'il est perdu ou
          volé, la caution sera intégralement conservée par Allo Charge à titre de dédommagement et la commande sera
          considérée comme close.
        </div>
        <div class="terms-clause">
          <span class="terms-clause-num">5.2.</span>
          En cas de restitution d'un Power Bank volontairement endommagé, l'Entreprise se réserve le droit de retenir
          tout ou partie de la caution.
        </div>
      </div>

      <div class="terms-section">
        <div class="terms-section-title">ARTICLE 6 : LIMITATION DE RESPONSABILITÉ</div>
        <p class="terms-section-body">
          L'Entreprise s'efforce de fournir des Power Banks en parfait état de fonctionnement. Toutefois, Allo Charge ne
          saurait être tenue responsable des dommages indirects, de la perte de données, ou de tout dommage causé au
          téléphone de l'Utilisateur découlant de l'utilisation du Power Bank.
        </p>
      </div>

      <div class="terms-section">
        <div class="terms-section-title">ARTICLE 7 : DONNÉES PERSONNELLES</div>
        <p class="terms-section-body">
          Nous collectons et traitons vos données personnelles (numéro de téléphone, historique de location) dans le
          strict respect de la législation en vigueur en Côte d'Ivoire, uniquement dans le but de fournir et d'améliorer
          notre service.
        </p>
      </div>

      <div class="terms-section">
        <div class="terms-section-title">ARTICLE 8 : MODIFICATION ET LOI APPLICABLE</div>
        <div class="terms-clause">
          <span class="terms-clause-num">8.1.</span>
          INSTAPRINT se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entreront en
          vigueur dès leur publication sur la plateforme.
        </div>
        <div class="terms-clause">
          <span class="terms-clause-num">8.2.</span>
          Les présentes CGU sont régies par la loi de la République de Côte d'Ivoire. Tout litige sera soumis aux
          juridictions compétentes d'Abidjan.
        </div>
      </div>

      <div class="terms-footer">
        <p>© INSTAPRINT – Allo Charge. Tous droits réservés.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();
</script>

<style scoped>
.terms-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.terms-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.terms-header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.terms-body {
  flex: 1;
  padding: 20px 16px 40px;
}

.terms-main-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 4px;
}

.terms-brand {
  font-size: 18px;
  font-weight: 800;
  color: #10b981;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.terms-intro {
  font-size: 13.5px;
  color: #555;
  line-height: 1.8;
  margin-bottom: 24px;
  padding: 14px;
  background: #fff;
  border-radius: 10px;
  border-left: 3px solid #10b981;
}

.terms-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.terms-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 10px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.terms-section-body {
  font-size: 13.5px;
  color: #444;
  line-height: 1.8;
  margin: 0;
}

.terms-clause {
  font-size: 13.5px;
  color: #444;
  line-height: 1.8;
  margin-bottom: 10px;
  display: flex;
  gap: 6px;
}

.terms-clause:last-child {
  margin-bottom: 0;
}

.terms-clause-num {
  font-weight: 600;
  color: #10b981;
  flex-shrink: 0;
  min-width: 28px;
}

.terms-footer {
  text-align: center;
  margin-top: 28px;
  font-size: 12px;
  color: #aaa;
}
</style>
