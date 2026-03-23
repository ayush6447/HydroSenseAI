import pickle, json
def export_feature_names(path="../../saved_models/xgboost_yield.pkl"):
    with open(path, "rb") as f:
        model = pickle.load(f)
    print("Model ready for inference service")
