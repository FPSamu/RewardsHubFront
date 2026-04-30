import { useState, useEffect } from 'react';
import authService from '../services/authService';
import userPointsService from '../services/userPointsService';
import businessService from '../services/businessService';
import deliveryService from '../services/deliveryService';
import rewardService from '../services/rewardService';
import * as membershipService from '../services/membershipService';

import { WelcomeSection }         from '../components/client/home/WelcomeSection';
import { StatsSection }           from '../components/client/home/StatsSection';
import { QRSection }              from '../components/client/home/QRSection';
import { AvailableRewardsSection } from '../components/client/home/AvailableRewardsSection';
import { CloseRewardsSection }    from '../components/client/home/CloseRewardsSection';
import { MembershipsSection }     from '../components/client/home/MembershipsSection';
import { BusinessSearchSection }  from '../components/client/home/BusinessSearchSection';
import { RecentActivitySection }  from '../components/client/home/RecentActivitySection';
import { RedeemFAB }              from '../components/client/home/RedeemFAB';
import { BusinessRewardsModal }   from '../components/client/home/modals/BusinessRewardsModal';
import { RedeemCodeModal }        from '../components/client/home/modals/RedeemCodeModal';

const ClientHome = () => {
  const [user, setUser]                   = useState(null);
  const [userPointsData, setUserPointsData] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [searchTerm, setSearchTerm]       = useState('');

  const [availableRewards, setAvailableRewards] = useState([]);
  const [closeRewards, setCloseRewards]         = useState([]);
  const [memberships, setMemberships]           = useState([]);

  const [selectedBusiness, setSelectedBusiness]   = useState(null);
  const [businessRewards, setBusinessRewards]     = useState([]);
  const [loadingRewards, setLoadingRewards]       = useState(false);

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode]           = useState('');
  const [redeemStatus, setRedeemStatus]       = useState('idle');
  const [redeemResult, setRedeemResult]       = useState(null);
  const [redeemError, setRedeemError]         = useState('');

  // Listen for profile updates
  useEffect(() => {
    const refresh = () => setUser(authService.getCurrentUser());
    window.addEventListener('storage', refresh);
    window.addEventListener('userUpdated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('userUpdated', refresh);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      const pointsData = await userPointsService.getUserPoints();

      if (pointsData?.businessPoints?.length > 0) {
        const withMeta = await Promise.all(
          pointsData.businessPoints.map(async (bp) => {
            try {
              const biz = await businessService.getBusinessById(bp.businessId);
              return { ...bp, businessName: biz.name || 'Negocio', businessEmail: biz.email, businessLogoUrl: biz.logoUrl };
            } catch {
              return { ...bp, businessName: 'Negocio' };
            }
          })
        );
        pointsData.businessPoints = withMeta;

        const available = [];
        const close     = [];

        const allRewards = await Promise.all(
          withMeta.map(async (bp) => {
            try {
              const res = await rewardService.getBusinessRewards(bp.businessId);
              const arr = Array.isArray(res) ? res : (res?.rewards || []);
              return { bp, rewards: arr.filter(r => r.isActive !== false) };
            } catch {
              return { bp, rewards: [] };
            }
          })
        );

        for (const { bp, rewards } of allRewards) {
          const avgPPV = bp.stamps > 0 ? bp.points / bp.stamps : null;
          const meta = {
            businessName: bp.businessName,
            businessId: bp.businessId,
            businessLogoUrl: bp.businessLogoUrl,
            userPoints: bp.points,
            userStamps: bp.stamps,
          };

          for (const r of rewards) {
            const isPoints = r.type === 'points' || r.pointsRequired;
            const required = isPoints ? r.pointsRequired : (r.stampsRequired || r.targetStamps);
            const current  = isPoints ? bp.points : bp.stamps;
            if (!required || required <= 0) continue;

            if (current >= required) {
              available.push({ ...r, ...meta });
            } else {
              const gap = required - current;
              const isClose = !isPoints
                ? gap <= 1
                : avgPPV ? gap <= avgPPV : current >= required * 0.75;
              if (isClose) close.push({ ...r, ...meta, gap, isPoints, avgPointsPerVisit: avgPPV });
            }
          }
        }

        setAvailableRewards(available);
        setCloseRewards(close);
      }

      setUserPointsData(pointsData);
      const myMemberships = await membershipService.getMyMemberships().catch(() => []);
      setMemberships(myMemberships);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBusinessClick = async (business) => {
    setSelectedBusiness(business);
    setBusinessRewards([]);
    setLoadingRewards(true);
    try {
      const res = await rewardService.getBusinessRewards(business.businessId);
      const arr = Array.isArray(res) ? res : (res?.rewards || []);
      setBusinessRewards(arr.filter(r => r.isActive !== false));
    } catch {
      setBusinessRewards([]);
    } finally {
      setLoadingRewards(false);
    }
  };

  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;
    setRedeemStatus('loading');
    setRedeemError('');
    try {
      const data = await deliveryService.claimCode(redeemCode.trim());
      setRedeemResult(data);
      setRedeemStatus('success');
      setRedeemCode('');
      await fetchData();
    } catch (err) {
      setRedeemStatus('error');
      setRedeemError(err.message || 'Código inválido o expirado');
    }
  };

  const closeRedeemModal = () => {
    setShowRedeemModal(false);
    setTimeout(() => {
      setRedeemStatus('idle');
      setRedeemResult(null);
      setRedeemError('');
      setRedeemCode('');
    }, 300);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3">
        <div className="w-10 h-10 border-[3px] border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">Cargando...</p>
      </div>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────────

  const businessPoints      = userPointsData?.businessPoints || [];
  const totalPoints         = businessPoints.reduce((s, bp) => s + bp.points, 0);
  const totalStamps         = businessPoints.reduce((s, bp) => s + bp.stamps, 0);
  const visitedBusinesses   = businessPoints.length;

  const businessesWithRewards = Object.values(
    availableRewards.reduce((acc, r) => {
      if (!acc[r.businessId]) {
        acc[r.businessId] = {
          businessId: r.businessId,
          businessName: r.businessName,
          businessLogoUrl: r.businessLogoUrl,
          rewardCount: 0,
        };
      }
      acc[r.businessId].rewardCount++;
      return acc;
    }, {})
  );

  const userId = user?.id || userPointsData?.userId || 'no-id';

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 py-2">
      {error && (
        <div className="mx-4 bg-accent-dangerBg border border-accent-dangerBorder text-accent-danger px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <WelcomeSection username={user?.username} />

      <StatsSection
        totalPoints={totalPoints}
        totalStamps={totalStamps}
        visitedBusinesses={visitedBusinesses}
      />

      <AvailableRewardsSection
        businesses={businessesWithRewards}
        businessPoints={businessPoints}
        onBusinessClick={handleBusinessClick}
      />

      {availableRewards.length === 0 && (
        <CloseRewardsSection
          rewards={closeRewards}
          businessPoints={businessPoints}
          onBusinessClick={handleBusinessClick}
        />
      )}

      <QRSection userId={userId} />

      <MembershipsSection memberships={memberships} />

      <BusinessSearchSection
        businesses={businessPoints}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onBusinessClick={handleBusinessClick}
      />

      <RecentActivitySection
        businessPoints={businessPoints}
        onBusinessClick={handleBusinessClick}
      />

      <RedeemFAB onClick={() => setShowRedeemModal(true)} />

      <BusinessRewardsModal
        business={selectedBusiness}
        rewards={businessRewards}
        loading={loadingRewards}
        onClose={() => setSelectedBusiness(null)}
      />

      <RedeemCodeModal
        isOpen={showRedeemModal}
        onClose={closeRedeemModal}
        code={redeemCode}
        onCodeChange={setRedeemCode}
        onSubmit={handleRedeemSubmit}
        status={redeemStatus}
        result={redeemResult}
        error={redeemError}
      />
    </div>
  );
};

export default ClientHome;
