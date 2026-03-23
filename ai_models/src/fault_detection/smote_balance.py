from imblearn.over_sampling import SMOTE
import numpy as np

def apply_smote(X, y, random_state=42):
    print(f"Before SMOTE: {dict(zip(*np.unique(y, return_counts=True)))}")
    sm = SMOTE(random_state=random_state)
    X_res, y_res = sm.fit_resample(X, y)
    print(f"After SMOTE:  {dict(zip(*np.unique(y_res, return_counts=True)))}")
    return X_res, y_res
