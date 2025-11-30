#include <stdio.h>
#include <string.h>

// Function to reverse a string in place
void reverse_string(char *str) {
    int length = strlen(str);
    int start = 0;
    int end = length - 1;
    
    while (start < end) {
        // Swap characters
        char temp = str[start];
        str[start] = str[end];
        str[end] = temp;
        
        start++;
        end--;
    }
}

// Function to count words in a string
int count_words(char *str) {
    int count = 0;
    int in_word = 0;
    
    for (int i = 0; str[i] != '\0'; i++) {
        if (str[i] != ' ' && !in_word) {
            count++;
            in_word = 1;
        } else if (str[i] == ' ') {
            in_word = 0;
        }
    }
    
    return count;
}

int main() {
    char text[] = "Hello world from C";
    
    printf("Original: %s\n", text);
    reverse_string(text);
    printf("Reversed: %s\n", text);
    
    return 0;
}