import cv2
import sys
import subprocess
import os
import onnxruntime
import numpy as np
import time

class model:
    def __init__(self):
        self.session = onnxruntime.InferenceSession('model.onnx')
        self.detect_count = 0


    def has_helmet(self, image):
        input_height, input_width = 512, 512
        image_resized = cv2.resize(image, (input_width, input_height))
        image_resized = image_resized.astype(np.float32)

        image_input = np.transpose(image_resized, (2, 0, 1))
        image_input = np.expand_dims(image_input, axis=0)

        input_name = self.session.get_inputs()[0].name
        outputs = self.session.run(None, {input_name: image_input})

        detections = outputs[0]


        for detection in detections.T:
            objectness_score = detection[4] * 100
            if objectness_score > 1:
                print(f"Objectness: {float(objectness_score):.2f}%")
            if objectness_score > 70:
                x_center = detection[0]
                y_center = detection[1]
                width = detection[2]
                height = detection[3]
                
                class_scores = detection[5:]
                class_id = np.argmax(class_scores)
                confidence = class_scores[class_id]

                print("Non-hardhat detected with over 70%% confidence!")
                print(f"Detected class ID: {class_id}, confidence: {confidence}")
                print(f"Bounding box: [x_center: {x_center}, y_center: {y_center}, width: {width}, height: {height}]")
                #time.sleep(0.4)
                return False
        return True



def extract_subvideo_ffmpeg(second, minute, input_file, output_file):
    position = minute * 60 + second
    start, end = max(0, position - 10), min(TOTAL_SECONDS, position+9)
    command = [
        "ffmpeg",
        "-y",
        "-i", input_file,
        "-ss", str(start),
        "-t", str(end - start),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-strict", "experimental",
        output_file
    ]
    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)






sec_between_frame = 1
output_dir = 'extract'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

n = len(sys.argv)
if n < 2:
    print("Usage: python3 video2frame.py <video_file>")
    sys.exit(1)

vid = cv2.VideoCapture(sys.argv[1])

fps = vid.get(cv2.CAP_PROP_FPS)
frame_skip = int(fps * sec_between_frame)

# get total seconds of video
TOTAL_SECONDS = round(vid.get(cv2.CAP_PROP_FRAME_COUNT)  / vid.get(cv2.CAP_PROP_FPS) ) 





count = 0
prev_time = 0
i = 0
frame_count = 0


custom_model = model()
    
while vid.isOpened():
    ret, frame = vid.read()
    if not ret:
        break
    if i > frame_skip - 1:

        frame_count += 1
        timestamp_sec = frame_count*sec_between_frame % 60
        timestamp_min = frame_count*sec_between_frame // 60
        if not custom_model.has_helmet(frame) and (frame_count*sec_between_frame) > prev_time:
            "Extracting video clip"
            extract_subvideo_ffmpeg(timestamp_sec, timestamp_min, sys.argv[1], f"extract/sub_vid{count}.mp4")
            prev_time = frame_count*sec_between_frame + 10
            count += 1

        i = 0
        continue
    i += 1

vid.release()
cv2.destroyAllWindows()


