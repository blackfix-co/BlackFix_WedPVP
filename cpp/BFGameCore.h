#pragma once

#ifdef __cplusplus
extern "C" {
#endif

typedef struct BFVec3 {
  float x;
  float y;
  float z;
} BFVec3;

typedef struct BFAimResult {
  float x;
  float y;
  float z;
  float distance;
} BFAimResult;

float BFClamp(float value, float low, float high);
float BFCardRange(float arenaRadius);
BFAimResult BFAimEndpoint(float posX, float posY, float posZ, float rotX, float rotY, float floorY, float arenaRadius, float moveLimit);
float BFSkillProjectileSpeed(int element, int cardType, int ultimate, int stream, int wave, int sun, int psychicLift, int firePillar, int support);
float BFSkillImpactDelay(int element, int cardType, int ultimate, int stream, int wave, int sun, int psychicLift, int firePillar, int support, float distance, float charge);
float BFCardHitRadius(int element, int cardType, int ultimate, int stream, int psychicLift, int waterBubble, int wave, int beam, int sun, float along, float charge);
float BFImpactHitRadius(int element, int cardType, int ultimate, int firePillar, int waterBubble, int psychicLift, int sun, int dragonSlam, int gravity, int roundSeal, int wave, float charge);
int BFLineHit(float originX, float originZ, float dirX, float dirZ, float hitX, float hitZ, float targetX, float targetZ, float range, float radius, float bodyRadius);
int BFAreaHit(float hitX, float hitZ, float targetX, float targetZ, float radius, float bodyRadius);
int BFUpgradeDelayMs(int readyCount);

#ifdef __cplusplus
}
#endif
