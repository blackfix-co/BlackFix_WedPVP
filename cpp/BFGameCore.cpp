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
  const float range = BFCardRange(arenaRadius);
  const float pitch = BFClamp(rotX, -1.18f, 1.18f);
  const float cp = std::cos(pitch);
  const BFVec3 v = {-std::sin(rotY) * cp, std::sin(pitch), -std::cos(rotY) * cp};
  const BFVec3 origin = {posX, posY + 0.25f, posZ};
  float distance = range;
  if (v.y < -0.025f) {
    const float floorDistance = (origin.y - floorY) / -v.y;
    if (floorDistance > 0.01f && floorDistance < range) distance = floorDistance;
  }
  float x = origin.x + v.x * distance;
  float z = origin.z + v.z * distance;
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
  if (wave) return 1.05f;
  if (firePillar) return 0.82f;
  if (speed <= 0.0f) return cc ? BFClamp((element == 0 ? 0.55f : 0.42f) + distance * 0.004f, 0.42f, 1.35f) : 0.16f;
  float windup = stream ? 0.1f : 0.24f;
  if (cc) windup += element == 2 ? 0.62f : element == 5 ? 0.52f : element == 0 || element == 3 ? 0.55f : 0.42f;
  if (ultimate) windup += element == 4 ? 0.82f : element == 2 ? 0.85f : element == 3 ? 0.95f : element == 5 ? 0.9f : element == 7 ? 0.82f : 0.72f;
  if (sun) windup = 0.72f + charge * 0.42f;
  if (psychicLift) windup += 0.35f;
  const float worldSpeed = stream ? 18.0f + speed * 4.8f : 9.0f + speed * 3.6f;
  const float travel = distance / worldSpeed;
  return BFClamp(windup + travel, stream ? 0.18f : 0.34f, stream ? 1.35f : 2.75f);
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
