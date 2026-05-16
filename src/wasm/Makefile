BUILD_DIR = ../../public

build:
	emcc calculator.cpp -o $(BUILD_DIR)/calculator.js \
		-s EXPORTED_FUNCTIONS='["_calculate","_getPointsValueSummary"]' \
		-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","UTF8ToString","stringToUTF8","lengthBytesUTF8","_malloc","_free"]' \
		-s MODULARIZE=1 \
		-s EXPORT_NAME='CalculatorModule' \
		-s ALLOW_MEMORY_GROWTH=1 \
		-O2

clean:
	rm -f $(BUILD_DIR)/calculator.js $(BUILD_DIR)/calculator.wasm

.PHONY: build clean
