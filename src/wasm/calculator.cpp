#include <emscripten/emscripten.h>
#include <string>
#include <sstream>
#include <algorithm>

struct RedemptionRates {
  float cashback;
  float flights;
  float hotels;
  float shopping;
  float statementCredit;
};

struct CardRules {
  float pointsPerRupee;
  int expiryMonths;
  int minRedemptionPoints;
  RedemptionRates rates;
};

struct RedemptionResult {
  float cashback;
  float flights;
  float hotels;
  float shopping;
  float statementCredit;
  std::string bestOption;
  float bestValue;
  bool expiryWarning;
  bool belowMinimum;
};

struct CategoryValue {
  const char* name;
  float value;
};

static void setBestOption(RedemptionResult& result) {
  const CategoryValue categories[] = {
    {"cashback", result.cashback},
    {"flights", result.flights},
    {"hotels", result.hotels},
    {"shopping", result.shopping},
    {"statementCredit", result.statementCredit},
  };

  const CategoryValue* best = &categories[0];
  for (size_t i = 1; i < sizeof(categories) / sizeof(categories[0]); ++i) {
    if (categories[i].value > best->value) {
      best = &categories[i];
    }
  }

  result.bestOption = best->name;
  result.bestValue = best->value;
}

static RedemptionResult computeRedemption(
  float cashbackRate,
  float flightsRate,
  float hotelsRate,
  float shoppingRate,
  float statementCreditRate,
  int points,
  int minRedemptionPoints,
  int expiryMonths
) {
  RedemptionResult result{};
  const float pts = static_cast<float>(points);

  result.cashback = pts * cashbackRate;
  result.flights = pts * flightsRate;
  result.hotels = pts * hotelsRate;
  result.shopping = pts * shoppingRate;
  result.statementCredit = pts * statementCreditRate;

  result.belowMinimum = points < minRedemptionPoints;
  result.expiryWarning = expiryMonths > 0 && expiryMonths <= 3;

  setBestOption(result);
  return result;
}

static const char* redemptionResultToJson(const RedemptionResult& result) {
  std::ostringstream json;
  json << "{";
  json << "\"cashback\":" << result.cashback << ",";
  json << "\"flights\":" << result.flights << ",";
  json << "\"hotels\":" << result.hotels << ",";
  json << "\"shopping\":" << result.shopping << ",";
  json << "\"statementCredit\":" << result.statementCredit << ",";
  json << "\"bestOption\":\"" << result.bestOption << "\",";
  json << "\"bestValue\":" << result.bestValue << ",";
  json << "\"expiryWarning\":" << (result.expiryWarning ? "true" : "false") << ",";
  json << "\"belowMinimum\":" << (result.belowMinimum ? "true" : "false");
  json << "}";

  static std::string serialized;
  serialized = json.str();
  return serialized.c_str();
}

extern "C" {

EMSCRIPTEN_KEEPALIVE
const char* calculate(
  float cashbackRate,
  float flightsRate,
  float hotelsRate,
  float shoppingRate,
  float statementCreditRate,
  int points,
  int minRedemptionPoints,
  int expiryMonths
) {
  const RedemptionResult result = computeRedemption(
    cashbackRate,
    flightsRate,
    hotelsRate,
    shoppingRate,
    statementCreditRate,
    points,
    minRedemptionPoints,
    expiryMonths
  );
  return redemptionResultToJson(result);
}

EMSCRIPTEN_KEEPALIVE
const char* getPointsValueSummary(int points, float bestRate) {
  const float bestRupeeValue = static_cast<float>(points) * bestRate;

  std::ostringstream json;
  json << "{";
  json << "\"points\":" << points << ",";
  json << "\"bestRupeeValue\":" << bestRupeeValue;
  json << "}";

  static std::string serialized;
  serialized = json.str();
  return serialized.c_str();
}

}