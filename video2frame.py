import cv2
import sys
import os

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

success,image = vid.read()

count = 0
i = 0
frame_count = 0
    
while vid.isOpened():
    ret, frame = vid.read()
    if not ret:
        break
    if i > frame_skip - 1:
        frame_count += 1
        timestamp_sec = frame_count*sec_between_frame % 60
        timestamp_min = frame_count*sec_between_frame // 60
        cv2.imwrite('extract/test_'+str(timestamp_min)+'-'+str(timestamp_sec)+'.jpg', frame)
        i = 0
        continue
    i += 1

vid.release()
cv2.destroyAllWindows()
