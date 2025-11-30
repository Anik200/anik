#include <stdio.h>
#include <string.h>

// Function to concatenate two strings
char* string_concat(char* dest, const char* src) {
    return strcat(dest, src);
}

// Function to find the length of a string
int string_length(const char* str) {
    return strlen(str);
}

// Function to compare two strings
int string_compare(const char* str1, const char* str2) {
    return strcmp(str1, str2);
}

int main() {
    char str1[50] = "Hello ";
    char str2[] = "World!";
    char str3[] = "Hello World!";
    
    printf("String 1: %s (length: %d)\n", str1, string_length(str1));
    printf("String 2: %s (length: %d)\n", str2, string_length(str2));
    
    string_concat(str1, str2);
    printf("Concatenated: %s\n", str1);
    
    int comparison = string_compare(str1, str3);
    if (comparison == 0) {
        printf("The concatenated string matches str3.\n");
    } else {
        printf("The concatenated string does not match str3 (comparison: %d).\n", comparison);
    }
    
    return 0;
}