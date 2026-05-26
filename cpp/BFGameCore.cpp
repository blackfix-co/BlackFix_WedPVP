#include "BFGameCore.h"

#include <cmath>

namespace {
float bfMax(float a, float b) { return a > b ? a : b; }
float bfMin(float a, float b) { return a < b ? a : b; }
float bfHypot(float x, float z) { return std::sqrt(x * x + z * z); }
int isCc(int cardType) { return cardType == 2; }
}

extern "C" {

float BFClamp(float value, float low, float high) {
  return bfMax(low, bfMin(high, value));
}

float BFCardRange(float arenaRadius) {
  return arenaRadius * 2.0f + 32.0f;
}

BFAimResult BFAimEndpoint(float posX, float posY, float posZ, float rotX, float rotY, float floorY, float arenaRadius, float moveLimit) {
  (void)rotX;
  (void)arenaRadius;
  const BFVec3 origin = {posX, posY + 0.25f, posZ};
  const float dirX = -std::sin(rotY);
  const float dirZ = -std::cos(rotY);
  const float b = origin.x * dirX + origin.z * dirZ;
  const float c = origin.x * origin.x + origin.z * origin.z - moveLimit * moveLimit;
  const float distance = bfMax(0.1f, -b + std::sqrt(bfMax(0.0f, b * b - c)));
  float x = origin.x + dirX * distance;
  float z = origin.z + dirZ * distance;
  float d = bfHypot(x, z);
  if (d > moveLimit && d > 0.001f) {
    x = x / d * moveLimit;
    z = z / d * moveLimit;
  }
  const float flat = bfHypot(x - origin.x, z - origin.z);
  return {x, floorY, z, flat};
}

float BFSkillProjectileSpeed(int element, int cardType, int ultimate, int stream, int wave, int sun, int psychicLift, int firePillar, int support) {
  if (psychicLift) return 6.0f;
  if (wave) return 3.8f;
  if (support || firePillar) return 0.0f;
  if (sun) return 4.0f;
  if (stream) {
    if (element == 2 || element == 5 || element == 8) return 10.0f;
    if (element == 4 || element == 11) return 9.0f;
    if (element == 1 || element == 7 || element == 9) return 8.0f;
    if (element == 3) return 6.0f;
    return 7.0f;
  }
  if (ultimate) {
    if (element == 8) return 0.0f;
    if (element == 0) return 4.0f;
    if (element == 1 || element == 3) return 5.0f;
    if (element == 2 || element == 5) return 10.0f;
    if (element == 4 || element == 11) return 1.0f;
    if (element == 7 || element == 10) return 2.0f;
    return 4.0f;
  }
  if (isCc(cardType)) {
    if (element == 8 || element == 0) return 0.0f;
    if (element == 2) return 10.0f;
    if (element == 3 || element == 7) return 5.0f;
    if (element == 5 || element == 9) return 9.0f;
    if (element == 11) return 8.0f;
    return 6.0f;
  }
  if (element == 2 || element == 5) return 10.0f;
  if (element == 11 || element == 4) return 9.0f;
  if (element == 1 || element == 7 || element == 9) return 8.0f;
  if (element == 3) return 6.0f;
  return 7.0f;
}

float BFSkillImpactDelay(int element, int cardType, int ultimate, int stream, int wave, int sun, int psychicLift, int firePillar, int support, float distance, float charge) {
  const float speed = BFSkillProjectileSpeed(element, cardType, ultimate, stream, wave, sun, psychicLift, firePillar, support);
  const int cc = isCc(cardType);
  if (stream) return BFClamp(0.16f + distance / (90.0f + speed * 9.0f), 0.16f, 0.42f);
  if (wave) return BFClamp(0.65f + distance / 115.0f, 0.65f, 1.45f);
  if (firePillar) return BFClamp(0.65f + distance / 180.0f, 0.65f, 1.05f);
  if (sun) return BFClamp(0.65f + charge * 0.18f + distance / 125.0f, 0.65f, 1.55f);
  if (psychicLift) return BFClamp(0.65f + distance / 125.0f, 0.65f, 1.45f);
  const int area = ultimate || wave || sun || psychicLift || firePillar;
  const float low = area ? 0.65f : cc ? 0.42f : 0.28f;
  const float high = area ? 1.65f : cc ? 1.35f : 1.1f;
  const float worldSpeed = speed > 0.0f ? 28.0f + speed * 7.0f : 70.0f;
  return BFClamp(low + distance / worldSpeed, low, high);
}

float BFCardHitRadius(int element, int cardType, int ultimate, int stream, int psychicLift, int waterBubble, int wave, int beam, int sun, float along, float charge) {
  float base = 4.8f;
  if (element == 2 || element == 5 || element == 11) base = 3.6f;
  if (element == 4) base = 4.2f;
  if (element == 3 || element == 8) base = 5.6f;
  if (element == 6) base = 5.4f;
  if (element == 7) base = 4.9f;
  if (element == 9) base = 4.5f;
  if (element == 10) base = 4.2f;
  if (psychicLift) base = 5.4f;
  if (stream) base = bfMax(3.7f, base - 0.4f);
  if (waterBubble) base = 6.4f;
  if (wave) base = 7.8f;
  if (beam) base = 5.4f;
  if (isCc(cardType)) base += element == 5 || element == 4 || element == 11 ? 1.3f : 2.0f;
  if (ultimate && !wave) base += element == 1 ? 5.0f : element == 8 || element == 9 ? 5.0f : element == 4 || element == 6 ? 4.0f : element == 7 ? 3.6f : 3.0f;
  if (sun) base = 12.5f;
  if (charge > 0.0f) base += charge * 1.2f;
  return base + bfMin(5.2f, bfMax(0.0f, along) * 0.04f);
}

float BFImpactHitRadius(int element, int cardType, int ultimate, int firePillar, int waterBubble, int psychicLift, int sun, int dragonSlam, int gravity, int roundSeal, int wave, float charge) {
  if (wave) return 0.0f;
  if (firePillar) return 9.2f;
  if (waterBubble) return 4.8f;
  if (psychicLift) return 8.5f;
  if (sun) return 15.0f + charge * 2.5f;
  if (dragonSlam) return 16.0f;
  if (gravity) return 13.0f;
  if (roundSeal) return 12.0f;
  if (ultimate) return element == 8 ? 14.0f : element == 9 || element == 1 || element == 6 ? 13.0f : element == 4 ? 12.0f : element == 7 ? 11.0f : element == 3 ? 10.0f : element == 0 ? 11.0f : 8.5f;
  if (isCc(cardType)) return element == 8 ? 8.0f : element == 9 ? 7.0f : element == 11 ? 6.2f : element == 0 ? 8.5f : element == 3 ? 7.2f : element == 7 ? 7.0f : element == 2 ? 5.8f : element == 5 ? 6.4f : 6.8f;
  return element == 8 ? 6.0f : element == 0 || element == 6 ? 5.5f : 4.6f;
}

int BFLineHit(float originX, float originZ, float dirX, float dirZ, float hitX, float hitZ, float targetX, float targetZ, float range, float radius, float bodyRadius) {
  const float dx = targetX - originX;
  const float dz = targetZ - originZ;
  const float along = dx * dirX + dz * dirZ;
  const float lateral = std::fabs(dx * dirZ - dz * dirX);
  const float impact = bfHypot(targetX - hitX, targetZ - hitZ);
  return (along > -bodyRadius && along <= range + bodyRadius && lateral <= radius + bodyRadius) || impact <= radius + bodyRadius;
}

int BFAreaHit(float hitX, float hitZ, float targetX, float targetZ, float radius, float bodyRadius) {
  return bfHypot(targetX - hitX, targetZ - hitZ) <= radius + bodyRadius;
}

int BFUpgradeDelayMs(int readyCount) {
  return readyCount > 0 ? 5000 : 0;
}

}
